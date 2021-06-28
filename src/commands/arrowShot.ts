import { isComment } from "../helpers/match";
import { filterMultilineCommentsToOneLine } from "../helpers/replace";

let wrongSyntax: boolean;

const arrowShot = (lines: string[], length: number): string[] => {
    // Start from the end to be able to turn two functions into one line when nested.
    lines = filterMultilineCommentsToOneLine(lines);
    lines.map(line => line).reverse().forEach((line, i) => {
        wrongSyntax = false;
        const index = lines.length - (i+1);

        lines[index] = fixSelfInvoking(line);

        if(
            isComment(line) ||
            !line.match(/(^|[=:,\(?]|return\b|export\b|default\b)(| +)function\b(| +)(|\w+)(| +)\(/g) || 
            (line.match(/function\b/g)?.length || 2) > 1 ||
            line.match(/('|"|&&|\|\||\?)( +|)function\b/)
        ) { return; }

        const FUNCTION_CONTENT = getFunctionContent([(line.split(/function\b.*\)( +|)/).pop() || ''), ...lines.slice(index+1)]);
        if(isFunctionUsesThis(FUNCTION_CONTENT.split('\n'))) { return; }

        const EXPORT_DEFAULT = line.match(/^(| +)(export\b +default\b +)/);
        const MODULE_EXPORTS = line.match(/^(| +)(module\b(| +).(| +)exports\b)(| +)=/);
        
        if((EXPORT_DEFAULT || MODULE_EXPORTS) && !line.match(/function\b(| +)\(/)) {
            const length = index + FUNCTION_CONTENT.split('\n').length;
            line = exportDefaultAndModuleExports(index, length, lines, EXPORT_DEFAULT || MODULE_EXPORTS);
        }

        const AFTER_EQUAL = !!lines[index-1]?.match(/[^=]=( +|)$/);
        if(
            line.match(/(^|export\b)(| +)function\b/) && 
            !isAnonymous(line, AFTER_EQUAL) && 
            !isAssignedToVariable(line, AFTER_EQUAL)
        ) { 
            const CODE_BEFORE = lines.slice(0, index).filter(line => !isComment(line)).join('\n');
            if(isFunctionCalledBeforeInitialized(CODE_BEFORE, line)) { return; }
            line = assignFunctionToVariable(line); 
        } else if (!line.match(/function\b(| +)\(/)) {
            line = line.replace(/(?<=\bfunction\s)(\w+)/, '');
        }


        const REST_OF_LINES = lines.slice(index+1, index+1 + FUNCTION_CONTENT.split('\n').length);
        const LINES_CHANGED = turnToArrow(line, REST_OF_LINES);

        if(wrongSyntax) { return; }

        lines.splice(index, LINES_CHANGED.length, ...LINES_CHANGED);

        if(isOnlyOneLine(FUNCTION_CONTENT)) { 
            lines.splice(index+1, getFunctionLinesNumber(FUNCTION_CONTENT)-1);
            lines[index] = turnToOneLine(FUNCTION_CONTENT, lines[index]);
        };
    });
    return lines;
};

const isFunctionCalledBeforeInitialized = (code: string, line: string): boolean => {
    const FUNCTION_NAME = line.match(/(?<=\bfunction\s)(\w+)/);
    if(!FUNCTION_NAME) { return false; }
    const FUNCTION_CALLED_REGEX = new RegExp(`(.*[^.a-zA-Z0-9$_]|^| )${FUNCTION_NAME[0]}\\b`);
    if(code.match(FUNCTION_CALLED_REGEX)) { return true; }
    return false;
};

const isAnonymous = (line: string, isAssign: boolean) => !isAssign && !line.match(/=( +|)function\b/) && line.match(/function\b(\(| +\()/);

const isAssignedToVariable = (line: string, isAssign: boolean) => isAssign || line.match(/(const|let|var)(| +)=( +|)function\b/);

const assignFunctionToVariable = (line: string): string => {
    if(line.match(/=( +|)function\b/)) { return line; }
    const FUNCTION_NAME = line.match(/(?<=\bfunction\s)(\w+)/);
    if(!FUNCTION_NAME) { 
        wrongSyntax = true;
        return line; 
    }
    return line.replace(new RegExp(`function\\b +${FUNCTION_NAME[0]}`), `const ${FUNCTION_NAME[0]} = function`);
};

const turnToArrow = (line: string, lines: string[]): string[] => {
    const FUNCTION = line.match(/function\b( +|)/);

    if(!FUNCTION) { wrongSyntax = true; }
    if(wrongSyntax) { return [line]; }

    let index = ((FUNCTION||[])[0]).length + ((FUNCTION||[]).index || 0);
    let { args, after } = getFunctionArgs([line.substring(index, line.length), ...lines]);

    const ARGS_REGEX = args.split('').map(char => '()[]{}<>$-=/*.?!'.includes(char) ? '\\' + char : char).join('');
    const ARGS_LINES = ARGS_REGEX.split('\n');
    
    if(isOneParameterOnly(args)) { 
        args = args.substring(1, args.length -1); 
    }
    // For bug found.
    if(ARGS_REGEX === '\\' || args === '\\') { return [line]; }

    const CHANGES = line.replace(new RegExp(`function\\b( +|)${ARGS_LINES[0]}.*$`), `${args} =>${after}`);
    const LINES_CHANGED = CHANGES.split('\n');
    return [...LINES_CHANGED];
};

const getFunctionArgs = (lines: string[]): {args: string, after: string} => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let functionArgs: string = '';
    let afterArgs: string = '';

    for(let line of lines) {
        let index = 0;
        while(line[index]) {
            if(line[index] === '(') { openBrackets++; } 
            else if(line[index] === ')') { closeBrackets++; }
            functionArgs += line[index];
            index++;
            if(closeBrackets && (closeBrackets === openBrackets)) { 
                afterArgs = line.substring(index, line.length);
                break; 
            }
        }
        if(closeBrackets && (closeBrackets === openBrackets)) { break; }
        functionArgs += '\n';
    }
    if(openBrackets - closeBrackets) { wrongSyntax = true; }
    return { args: functionArgs, after: afterArgs};
};

const isOneParameterOnly = (line: string): boolean => !line.match(/,/g) && !((line.match(/\(/g)?.length || 2) > 1) && !line.match(/\(( +|)\)/);

const getFunctionContent = (lines: string[]): string => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let content: string = '';

    for(let line of lines) {

        if(isComment(line)) {
            const br = line.match(/\n/g); 
            content += br ? br.join('') + '\n' : '\n';
            continue; 
        }

        for(let i = 0; i < line.length; i++) {
            if(line[i] === '{') { openBrackets++; }
            else if(line[i] === '}') { closeBrackets++; }
            content += line[i];
            if(closeBrackets && (openBrackets === closeBrackets)) { 
                const rest = line.substring(i+1, line.length).match(/^.*[^a-zA-Z0-9$_]/);
                if(rest) { content += rest[0]; }
                break; 
            }
        };
        if(closeBrackets && (openBrackets === closeBrackets)) { break; }
        content += '\n';
    }
    if(openBrackets - closeBrackets) { wrongSyntax = true; }
    return content;
};

const isFunctionUsesThis = (lines: string[]): boolean => {
    let isInInnerFun = false, openBrackets = 0, closeBrackets = 0;
    for(let line of lines) {
        if(!isInInnerFun) {  
            const IS_FUNCTION_STARTS = line.match(/(.*[^.a-zA-Z0-9$_]|^| )function\b/);
            if(line.match(/(.*[^.a-zA-Z0-9$_]|^| )this\b/g)) { return true; }
            if(IS_FUNCTION_STARTS) {
                isInInnerFun = true;
                line = line.slice(IS_FUNCTION_STARTS[0].length);
            }
        } 
        if(isInInnerFun) {
            openBrackets += line.match(/{/g)?.length || 0;
            closeBrackets += line.match(/}/g)?.length || 0;
            if(!(openBrackets - closeBrackets)) { isInInnerFun = false; }
        }
        
    }
    return false;
};

const fixSelfInvoking = (line: string): string => line.replace(/\}( +|)\(( +|)\)( +|)\)/, '})()');

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

const exportDefaultAndModuleExports = (index: number, length: number, lines: string[], exports: RegExpMatchArray | null): string => {
    if(!exports) { return lines[index]; }
    lines[index] = lines[index].substring((exports.index || 0) + exports[0].length, lines[index].length).replace(/^ +/, '');
    lines.splice(length, 0, `\n${exports[0]} ${(lines[index].match(/(?<=\bfunction\s)(\w+)/)||[''])[0]};`.replace(/  +/, ' '));
    return lines[index];
};

export default arrowShot;