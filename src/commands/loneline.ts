import { isComment } from "../helpers/match";
import { FilteredLine } from "../interfaces/main";
import { getFilteredLines, getOriginalLine } from "../helpers/get";
import { addEscape, filterMultilineCommentsToOneLine, removeMultipleSpaces } from "../helpers/replace";
import { ARROW_FUNCTION_SIGN, CATCH_ONLY_RETURN_WORD, CONTROL_FLOW_SCOPE_START, CONTROL_FLOW_STATEMENT, CONTROL_FLOW_WITH_CONDITION_STATEMENT_CONTENT, CONTROL_FLOW_WITH_NO_CONDITION_AND_ARROW_FUNCTION_STATEMENT, CONTROL_FLOW_WORD, CURLY_BRACKETS_CLOSE_AT_END, CURLY_BRACKETS_OPEN_AT_END, CURLY_BRACKETS_OPEN_AT_START, DOT_AFTER_SCOPE_WRAPPER, EMPTY_SCOPE, LINE_BREAKS_G, ONE_SPACE_OR_MORE_G, ONLY_SEMICOLON, RETURN_OBJECT, RETURN_WORD, SEMICOLON_AND_SPACE_AROUND_AT_END, START_AND_SPACE_AFTER, TWO_SEMICOLON_OR_MORE_AT_END, WHITE_SPACE_AFTER_STATEMENT, WHITE_SPACE_AT_START, WHITE_SPACE_ONLY_OR_EMPTY } from "../helpers/regex";

const loneline = (lines: string[]): string[] => {
    lines = filterMultilineCommentsToOneLine(lines);
    const FILTERED_LINES: FilteredLine[] = getFilteredLines(lines);
    const length = lines.length;

    lines.map(line => line).reverse().forEach((line, i) => {
        const index = length - (i+1);
        const { newStr: filteredLine, str: originalLine } = FILTERED_LINES[index];

        if(isComment(line) || !filteredLine.match(CONTROL_FLOW_STATEMENT)) return;
        
        const IS_IT_ARROW_FUNCTION = filteredLine.match(ARROW_FUNCTION_SIGN);
        
        const IS_CONTROL_FLOW_SCOPE_START = filteredLine.match(CONTROL_FLOW_SCOPE_START);
        const CONTROL_FLOW_FIRST_LINE = getFilteredLines([IS_CONTROL_FLOW_SCOPE_START ? '{' + line.split(CONTROL_FLOW_SCOPE_START).pop() : '']);
        const LINES_AFTER_STATEMENT = [...CONTROL_FLOW_FIRST_LINE, ...FILTERED_LINES.slice(index+1)];

        if(isAlreadyLoneine(LINES_AFTER_STATEMENT)) return;
        const { isOneLine, content, length: scopeLength, endIndex } = getControlFlowContent(LINES_AFTER_STATEMENT);
        if(!isOneLine) return;
        if(IS_IT_ARROW_FUNCTION && !isArrowFunctionCanBeOneLine(content)) return;

        const statement =  
            (line.match(CONTROL_FLOW_WITH_CONDITION_STATEMENT_CONTENT)||[''])[0].replace(CURLY_BRACKETS_OPEN_AT_END, '') ||
            (filteredLine.match(CONTROL_FLOW_WITH_NO_CONDITION_AND_ARROW_FUNCTION_STATEMENT)||[''])[0] || line;

        const END_LINE = lines[index + scopeLength];
        const [START_LINE_SPACE] = END_LINE.match(WHITE_SPACE_AT_START)||[];
        const CONTENT_AFTER_END = END_LINE.slice(
            endIndex + (originalLine === END_LINE ? statement.length : content.includes(statement) ? statement.length + (END_LINE.length - (statement.length + content.length)) : 0), 
            END_LINE.length
        );

        let newContent = getNewContent(content);
        if(IS_IT_ARROW_FUNCTION) newContent = adjustContentToOneLineFunction(newContent);

        const NEW_LINE = (`${statement} ${newContent}`).replace(WHITE_SPACE_AFTER_STATEMENT(addEscape(statement)), ' ');
        if(NEW_LINE.length > 135) return;

        lines.splice(index, scopeLength);
        lines[index] = removeMultipleSpaces(NEW_LINE);

        if(!CONTENT_AFTER_END.replace(ONE_SPACE_OR_MORE_G, '')) return;
        if(CONTENT_AFTER_END.match(DOT_AFTER_SCOPE_WRAPPER)) {
            lines[index] = lines[index].replace(SEMICOLON_AND_SPACE_AROUND_AT_END, CONTENT_AFTER_END.replace(WHITE_SPACE_AT_START, ''));
        } else if(!CONTENT_AFTER_END.match(ONLY_SEMICOLON)) { 
            const NEW_LINE = `${
                (START_LINE_SPACE || '') + CONTENT_AFTER_END.replace(WHITE_SPACE_AT_START, '')
            };`.replace(TWO_SEMICOLON_OR_MORE_AT_END, ';');
            lines.splice(index+1, 0, NEW_LINE); 
        }
    });
    return lines;
};

const getNewContent = (content: string): string => {
    const IS_FUNCTION_EMPTY = content.match(EMPTY_SCOPE);
    if(IS_FUNCTION_EMPTY) return '{}';

    const [line] = content.replace(ONE_SPACE_OR_MORE_G, '').replace(CURLY_BRACKETS_OPEN_AT_START, '').split('\n').filter(line => !!line);
    if(isComment(line)) return content;
    
    return content.replace(LINE_BREAKS_G, '').replace(CURLY_BRACKETS_OPEN_AT_START, '').replace(CURLY_BRACKETS_CLOSE_AT_END, '').replace(SEMICOLON_AND_SPACE_AROUND_AT_END, ';'); 
};

const getControlFlowContent = (lines: FilteredLine[]): { isOneLine: boolean, content: string, length: number, endIndex: number } => {
    let content: string = '',
        openBrackets: number = 0, 
        closeBrackets: number = 0,
        breakLines: number = -1,
        endIndex: number = 0,
        isOnlyOneLine = { isOne: false, isBreaked: false, isTwo: false },
        index: number = -1;
    
    for(let line of lines) {
        const { newStr: filteredLine } = line;
        index++;
        breakLines++; 
        endIndex = 0;
        if(isOnlyOneLine.isTwo) return { isOneLine: false, content, length: -1, endIndex };
        else if(isOnlyOneLine.isOne) isOnlyOneLine.isBreaked = true;
        for(let i = 0; i < line.newStr.length; i++) {
            endIndex++;
            content += filteredLine[i];
            if(filteredLine[i] === '{') openBrackets++;
            else if(filteredLine[i] === '}') closeBrackets++;
            else if(filteredLine[i] !== ' ') isOnlyOneLine[isOnlyOneLine.isBreaked ? 'isTwo' : 'isOne'] = true;
        }
        content = getOriginalLine({...line, newStr: content});
        if(openBrackets && !(openBrackets - closeBrackets)) break;
    }
    return { isOneLine: !isOnlyOneLine.isTwo, content, length: breakLines, endIndex };
};

const isAlreadyLoneine = (lines: FilteredLine[]): boolean => {
    for(let line of lines) {
        if(line.str.match(CURLY_BRACKETS_OPEN_AT_START)) return false;
        else if(line.str.match(WHITE_SPACE_ONLY_OR_EMPTY)) continue;
        else return true;
    }
    return true;
};

const isArrowFunctionCanBeOneLine = (content: string): boolean => !content.match(CONTROL_FLOW_WORD);

const adjustContentToOneLineFunction = (content: string): string => {
    if(!content.match(RETURN_WORD)) return content;
    let newContent = content.replace(CATCH_ONLY_RETURN_WORD, '');
    if(content.match(RETURN_OBJECT)) {
        newContent = newContent.replace(START_AND_SPACE_AFTER, '(').replace(SEMICOLON_AND_SPACE_AROUND_AT_END, ');');
    }
    return newContent;
};

export default loneline;