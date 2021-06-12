import { isComment, isMultilineCommentEnds, isMultilineCommentStarts } from "../helpers/match";
import { removeMultipleSpaces } from "../helpers/replace";

let wrongSyntax: boolean, comment: boolean;

const arrowShot = (lines: string[], length: number): string[] => {
    // Start from the end to be able to turn two functions into one line when nested.
    lines.map(line => line).reverse().forEach((line, i) => {
        wrongSyntax = false;
        let index = length - (i+1);

        lines[index] = fixSlfInvoking(line);

        if(isMultilineCommentEnds(line)) { comment = true; }
        if(isMultilineCommentStarts(line)) { comment = false; }

        if(
            comment ||
            isComment(line) ||
            !line.match(/(^|[=:,\(?]|return\b)(| +)function\b(| +)(|\w+)(| +)\(/g) || 
            (line.match(/function\b/g)?.length || 2) > 1 ||
            line.match(/('|"|&&|\|\||:|\?)( +|)function\b/)
        ) { return; }

        const FUNCTION_CONTENT = getFunctionContent([(line.split(/function\b.*\)( +|)/).pop() || ''), ...lines.slice(index+1)]);
        if(isFunctionUsesThis(FUNCTION_CONTENT)) { return; }

        const AFTER_EQUAL = !!lines[index-1]?.match(/[^=]=( +|)$/);
        if(!isAnonymous(line, AFTER_EQUAL) && !isAssignedToVariable(line, AFTER_EQUAL)) { 
            line = assignFunctionToVariable(line); 
        }

        if(wrongSyntax) { return; }
        lines[index] = removeMultipleSpaces(turnToArrow(line));

        if(isOnlyOneLine(FUNCTION_CONTENT)) { 
            lines.splice(index+1, getFunctionLinesNumber(FUNCTION_CONTENT)-1);
            lines[index] = turnToOneLine(FUNCTION_CONTENT, lines[index]);
        };
    });
    return lines;
};

const isAnonymous = (line: string, isAssign: boolean) => !isAssign && !line.match(/=( +|)function\b/) && line.match(/function\b(\(| +\()/);

const isAssignedToVariable = (line: string, isAssign: boolean) => isAssign || line.match(/=( +|)function\b/);

const assignFunctionToVariable = (line: string): string => {
    if(line.match(/=( +|)function\b/)) { return line; }
    const FUNCTION_NAME = line.match(/(?<=\bfunction\s)(\w+)/);
    if(!FUNCTION_NAME) { 
        wrongSyntax = true;
        return line; 
    }
    return line.replace(new RegExp(`function\\b +${FUNCTION_NAME[0]}`), `const ${FUNCTION_NAME[0]} = function`);
};

const turnToArrow = (line: string): string => {
    const FUNCTION = line.match(/function\b( +|)/);
    if(!FUNCTION) { 
        wrongSyntax = true;
        return line; 
    }
    let index = FUNCTION[0].length + (FUNCTION.index || 0);
    let functionArgs = getFunctionArgs(line, index);
    const ARGS_REGEX = functionArgs.split('').map(char => '()[]{}<>$-=/*.?!'.includes(char) ? '\\' + char : char).join('');
    if(isOneParameterOnly(functionArgs)) { 
        functionArgs = functionArgs.substring(1, functionArgs.length -1); 
    }
    // For bug found.
    if(ARGS_REGEX === '\\' || functionArgs === '\\') { return line; }
    return line.replace(new RegExp(`function\\b( +|)${ARGS_REGEX}`), `${functionArgs} => `);
};

const getFunctionArgs = (line: string, index: number): string => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let functionArgs: string = '';

    while(line[index]) {
        if(line[index] === '(') { openBrackets++; } 
        else if(line[index] === ')') { closeBrackets++; }
        functionArgs += line[index];
        if(!(openBrackets - closeBrackets)) { break; } 
        index++;
    }
    if(openBrackets - closeBrackets) { wrongSyntax = true; }
    return functionArgs;
};

const isOneParameterOnly = (line: string): boolean => !line.match(/,/g) && !((line.match(/\(/g)?.length || 2) > 1) && !line.match(/\(( +|)\)/);

const getFunctionContent = (lines: string[]): string => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let content: string = '';

    for(let line of lines) {

        if(isMultilineCommentStarts(line)) { comment = true; }
        if(isMultilineCommentEnds(line)) { comment = false; }

        if(comment || isComment(line)) { break; }

        for(let i = 0; i < line.length; i++) {
            if(line[i] === '{') { openBrackets++; }
            else if(line[i] === '}') { closeBrackets++; }
            content += line[i];
            if(!(openBrackets - closeBrackets)) { 
                const rest = line.substring(i+1, line.length).match(/^.*[^a-zA-Z0-9$_]/);
                if(rest) { content += rest[0]; }
                break; 
            }
        };
        if(!(openBrackets - closeBrackets)) { break; }
        content += '\n';
    }
    if(openBrackets - closeBrackets) { wrongSyntax = true; }
    return content;
};

const isFunctionUsesThis = (content: string): boolean => !!content.match(/this\b/g);

const fixSlfInvoking = (line: string): string => line.replace(/\}( +|)\(( +|)\)( +|)\)/, '})()');

const isOnlyOneLine = (content: string): boolean => {
    const lines = content.split('\n').filter(line => !!line.match(/.*[^ ]/));
    if(lines.length !== 3) { return false; }
    if(
        lines[0].replace(/ +/g, '').length > 1 ||
        lines[1].match(/^(| +)(if\b|for\b|while\b|switch\b)/) || 
        !lines[2].replace(/ +/g, '').match(/^\}()|\);\}\)$/)
    ) { return false; }
    return true;
};

const getFunctionLinesNumber = (content: string): number => content.split('\n').length;

const turnToOneLine = (content: string, line: string) => {
    const lines = content.replace(/( +|^)return\b/, '').split('\n').filter(line => !!line.match(/.*[^ ]/));
    const close = lines[2].replace(/\}/, '').replace(/ /g, '');

    content = close ? lines[1].replace(/;(| +)$/,'') + close : lines[1];

    if(content.match(/^(| +)\{/)) { content = `(${content.replace(/^  +/, ' ').replace(/;/, '')});`; }
    return `${line.split('=>')[0]}=>${content.replace(/^  +/, ' ')};`.replace(/;+/, ';');
};

export default arrowShot;