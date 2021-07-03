import { isComment } from "../helpers/match";
import { addEscape, filterMultilineCommentsToOneLine } from "../helpers/replace";

const loneline = (lines: string[]): string[] => {
    lines = filterMultilineCommentsToOneLine(lines);
    const length = lines.length;
    lines.map(line => line).reverse().forEach((line, i) => {
        const index = length - (i+1);

        if(
            isComment(line) ||
            !line.match(/((.*[^.a-zA-Z0-9$_]|^| )(if|else|for|while|do)\b)|=>/)
        ) { return; }
        
        const IS_IT_ARROW_FUNCTION = line.match(/=>/);
        const CONTROL_FLOW_SCOPE_START_REGEX = /(((((if|for|while)\b).*\)|(else|do)\b))|=>)( +|){/;
        const CONTROL_FLOW_SCOPE_START = line.match(CONTROL_FLOW_SCOPE_START_REGEX);
        const CONTROL_FLOW_FIRST_LINE = CONTROL_FLOW_SCOPE_START ? '{' + line.split(CONTROL_FLOW_SCOPE_START_REGEX).pop() : '';
        const LINES_AFTER_STATEMENT = [CONTROL_FLOW_FIRST_LINE, ...lines.slice(index+1)];

        if(isAlreadyLoneine(LINES_AFTER_STATEMENT)) { return; }
        const { isOneLine, content, length: scopeLength } = getControlFlowContent(LINES_AFTER_STATEMENT.join('\n'));
        if(!isOneLine) { return; }
        if(IS_IT_ARROW_FUNCTION && !isArrowFunctionCanBeOneLine(content)) { return; }

        // Rest indicate that there are args that splitted and need closed brackets.
        let [statement, rest] = line.split(/(\)( +|){)|(?<=do\b|(else\b(?! +if))|=>).*/);
        if(rest) { statement += ')'; }

        const [CONTENT_AFTER_END] = lines[index + scopeLength].match(/(?<=\}).*/)||[];
        const [START_LINE_SPACE]  = lines[index + scopeLength].match(/^ +/)||[];

        let newContent = getNewContent(content);
        if(IS_IT_ARROW_FUNCTION) { newContent = adjustContentToOneLineFunction(newContent); }

        const NEW_LINE = (`${statement} ${newContent}`).replace(new RegExp(`(?<=${addEscape(statement)})( +)`), ' ');
        if(NEW_LINE.length > 135) { return; }

        lines.splice(index+1, scopeLength);
        lines[index] = NEW_LINE;
        if(CONTENT_AFTER_END) { lines.splice(index+1, 0, START_LINE_SPACE + CONTENT_AFTER_END.replace(/^ +/, '')); }
    });
    return lines;
};

const getNewContent = (content: string): string => {
    const IS_FUNCTION_EMPTY = content.match(/^( +|){(\n+| +|)}( +|)$/);
    if(IS_FUNCTION_EMPTY) { return '{}'; }

    const [line] = content.replace(/ +/g, '').replace(/{/, '').split('\n').filter(line => !!line);
    if(isComment(line)) { return content; }
    
    return content.replace(/\n/g, '').replace(/^( +|){/, '').replace(/}( +|)$/, '').replace(/( +|)(;|)( +|)$/, ';'); 
};

const getControlFlowContent = (lines: string): { isOneLine: boolean, content: string, length: number } => {
    let content: string = '',
        openBrackets: number = 0, 
        closeBrackets: number = 0,
        breakLines: number = 0,
        isOnlyOneLine = { isOne: false, isBreaked: false, isTwo: false };

    for(let i = 0; i < lines.length; i++) {
        content += lines[i];
        if(lines[i] === '{') { 
            openBrackets++; 
        } else if(lines[i] === '}') { 
            closeBrackets++; 
        } else if(lines[i] === '\n') { 
            if(isOnlyOneLine.isTwo) {
                return { isOneLine: false, content, length: -1 }; 
            } else if(isOnlyOneLine.isOne) {
                isOnlyOneLine.isBreaked = true;
            }
            breakLines++; 
        } else if(lines[i] !== ' ') { 
            isOnlyOneLine[isOnlyOneLine.isBreaked ? 'isTwo' : 'isOne'] = true;
        }
        if(openBrackets && !(openBrackets - closeBrackets)) { break; }
    }
    return { isOneLine: true, content, length: breakLines };
};

const isAlreadyLoneine = (lines: string[]): boolean => {
    for(let line of lines) {
        if(line.match(/^( +|){/)) {
            return false;
        } else if(line.match(/^( +|)$/)) {
            continue;
        } else {
            return true;
        }
    }
    return true;
};

const isArrowFunctionCanBeOneLine = (content: string): boolean => !content.match(/(.*[^.a-zA-Z0-9$_]|^| )(if|for|while|do)\b/);

const adjustContentToOneLineFunction = (content: string): string => {
    if(!content.match(/(.*[^.a-zA-Z0-9$_]|^| )return\b/)) { return content; }
    let newContent = content.replace(/(?<=[^.a-zA-Z0-9$_]|^| )return\b/, '');
    if(content.match(/(.*[^.a-zA-Z0-9$_]|^| )return\b( +|){/)) {
        newContent = newContent.replace(/^( +|)/, '(').replace(/( +|);( +|)$/, ');');
    }
    return newContent;
};

export default loneline;