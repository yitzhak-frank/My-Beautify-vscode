import { syntax } from "./main";
import { isOneParameterOnly } from "./match";
import { getFunctionArgs, getFunctionCloseBracketsIndex } from "./get";
import { ARROW_FUNCTION_SIGN_AT_END, CURLY_BRACKETS_CLOSE_AND_SPACE_AFTER_AT_END, CURLY_BRACKETS_OPEN_AND_SPACE_BEFORE_AT_START, CURLY_BRACKETS_OPEN_AT_START, FUNCTION_AFTER_LOGICAL_OPERATORS, FUNCTION_AND_ARGS, FUNCTION_ASSIGNED_TO_VARIABLE, FUNCTION_NAME, FUNCTION_WORD_AND_SPACE_AFTER, LINE_BREAKS_G, NAMED_FUNCTION_DECLARETION, RETURN_WORD, ROUND_BRACKETS_CLOSE_AND_SPACE_BEFORE_G, SEMICOLON_AND_SPACE_AROUND_AT_END, SEMICOLON_AND_SPACE_AROUND_AT_LINE_END_G, TWO_SEMICOLON_OR_MORE_AT_END, TWO_SPACE_OR_MORE_G, WHITE_SPACE_AT_START } from "../../helpers/regex";

export const fixSelfInvoking = (line: string): string => line.replace(/\}( +|)\(( +|)\)( +|)\)/, '})()');

export const assignFunctionToVariable = (line: string): string => {
    if(line.match(FUNCTION_ASSIGNED_TO_VARIABLE)) return line;
    const FUNCTION_NAME_MATCH = line.match(FUNCTION_NAME);
    if(!FUNCTION_NAME_MATCH) { 
        syntax.flag = true;
        return line; 
    }
    return line.replace(NAMED_FUNCTION_DECLARETION(FUNCTION_NAME_MATCH[0]), `const ${FUNCTION_NAME_MATCH[0]} = function`);
};

export const turnToArrow = (line: string, lines: string[], isAfterLogicalOperators: boolean): string[] => {
    const FUNCTION = line.match(FUNCTION_WORD_AND_SPACE_AFTER);

    if(!FUNCTION) syntax.flag = true;
    if(syntax.flag) return [line];

    let index = ((FUNCTION||[])[0]).length + ((FUNCTION||[]).index || 0);
    let { args, after } = getFunctionArgs([line.substring(index, line.length), ...lines]);

    const ARGS_REGEX = args.split('').map(char => '()[]{}<>$-=/*.?!'.includes(char) ? '\\' + char : char).join('');
    const ARGS_LINES = ARGS_REGEX.split(LINE_BREAKS_G);
    
    if(isOneParameterOnly(args)) args = args.substring(1, args.length -1);
    // For bug found.
    if(ARGS_REGEX === '\\' || args === '\\') return [line];
    if(isAfterLogicalOperators) args = '(' + args;
    const CHANGES = line.replace(FUNCTION_AND_ARGS(ARGS_LINES[0]), `${args} =>${after}`);
    const LINES_CHANGED = CHANGES.split(LINE_BREAKS_G);
    return [...LINES_CHANGED];
};

export const turnToOneLine = (content: string, line: string) => {
    // Need to get the exact position of the closed brackets in case that there are second argument with curly brackets after the function
    const END_INDEX = getFunctionCloseBracketsIndex(content);
    content = content.slice(0, END_INDEX) + content.slice(END_INDEX+1, content.length);
    content = content.replace(RETURN_WORD, '').replace(CURLY_BRACKETS_OPEN_AT_START, '').replace(SEMICOLON_AND_SPACE_AROUND_AT_LINE_END_G, match => match.replace(';', '')).replace(LINE_BREAKS_G, '');
    if(content.match(CURLY_BRACKETS_OPEN_AT_START)) { 
        content = ` (${content.replace(TWO_SPACE_OR_MORE_G, ' ').replace(CURLY_BRACKETS_OPEN_AND_SPACE_BEFORE_AT_START, '{').replace(CURLY_BRACKETS_CLOSE_AND_SPACE_AFTER_AT_END, '}')});`; 
    }
    let result = `${line.split('=>')[0]}=>${content.replace(TWO_SPACE_OR_MORE_G, ' ')};`.replace(TWO_SEMICOLON_OR_MORE_AT_END, ';').replace(SEMICOLON_AND_SPACE_AROUND_AT_END, ';').replace(ROUND_BRACKETS_CLOSE_AND_SPACE_BEFORE_G, ')');
    if(result.match(ARROW_FUNCTION_SIGN_AT_END)) result = result.replace(SEMICOLON_AND_SPACE_AROUND_AT_END, ' {};');
    return result;
};

export const exportDefaultAndModuleExports = (index: number, length: number, lines: string[], exports: RegExpMatchArray | null): string => {
    if(!exports) return lines[index];
    lines[index] = lines[index].substring((exports.index || 0) + exports[0].length, lines[index].length).replace(WHITE_SPACE_AT_START, '');
    lines.splice(length, 0, `\n${exports[0]} ${(lines[index].match(FUNCTION_NAME)||[''])[0]};`.replace(TWO_SPACE_OR_MORE_G, ' '));
    return lines[index];
};
