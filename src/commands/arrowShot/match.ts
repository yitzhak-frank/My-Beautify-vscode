import { ANONYMOUS_FUNCTION, COMMA, CURLY_BRACKETS_CLOSE_G, CURLY_BRACKETS_OPEN_G, FUNCTION_ASSIGNED_TO_VARIABLE, FUNCTION_INVOKED, FUNCTION_NAME, FUNCTION_NOT_ARROW_DECLARETION, FUNCTION_DECLARETION, NO_PARAMETERS, ONE_LINE_FUNCTION, ONE_SPACE_OR_MORE_G, ROUND_BRACKETS_OPEN_G, SCOPE_WITH_ONE_LINE_CONTENT, THIS_WORD, CONTROL_FLOW_STATEMENT } from "../../helpers/regex";
import { FilteredLine } from "../../interfaces/main";

export const isAnonymous = (line: string, isAssign: boolean) => !isAssign && !isAssignedToVariable(line, isAssign) && line.match(ANONYMOUS_FUNCTION);

export const isAssignedToVariable = (line: string, isAssign: boolean) => isAssign || line.match(FUNCTION_ASSIGNED_TO_VARIABLE);

export const isOneParameterOnly = (line: string): boolean => !line.match(COMMA) && !((line.match(ROUND_BRACKETS_OPEN_G)?.length || 2) > 1) && !line.match(NO_PARAMETERS);

export const isOnlyOneLine = (content: string): boolean => !!content.replace(ONE_SPACE_OR_MORE_G, '').match(SCOPE_WITH_ONE_LINE_CONTENT) && !content.match(CONTROL_FLOW_STATEMENT);

export const isFunctionCalledBeforeInitialized = (lines: FilteredLine[], line: string): boolean => {
    const FUNCTION_NAME_MATCH = line.match(FUNCTION_NAME);
    if(!FUNCTION_NAME_MATCH) { return false; }
    if(!lines.join('\n').match(FUNCTION_INVOKED(FUNCTION_NAME_MATCH[0]))) return false;

    let existingFunctions: {start: number, end: number, openBrackets: number, closeBrackets: number, closed: boolean}[] = [];
    let functionCalls: number[] = [];

    lines.forEach((line, i) => {
        let { newStr: filteredLine } = line;
        const IS_FUNCTION_STARTS = filteredLine.match(FUNCTION_DECLARETION);
        if(IS_FUNCTION_STARTS) { 
            const IS_ONE_LINE_FUNCTION = filteredLine.match(ONE_LINE_FUNCTION);
            if(IS_ONE_LINE_FUNCTION) { 
                existingFunctions.push({start: i, end: i, closed: true, openBrackets: 0, closeBrackets: 0});
            } else {
                existingFunctions.push({start: i, end: -1, closed: false, openBrackets: 0, closeBrackets: 0});
                filteredLine = filteredLine.slice(IS_FUNCTION_STARTS.index, filteredLine.length);
            }
        }
        const IS_INSIDE_FUNCTION: boolean = existingFunctions.some(fun => !fun.closed);
        if(IS_INSIDE_FUNCTION) {
            existingFunctions.forEach((fun, x) => {
                if(!fun.closed) {
                    existingFunctions[x].openBrackets += filteredLine.match(CURLY_BRACKETS_OPEN_G)?.length || 0;
                    existingFunctions[x].closeBrackets += filteredLine.match(CURLY_BRACKETS_CLOSE_G)?.length || 0;
                }
                if((fun.openBrackets && !(fun.openBrackets - fun.closeBrackets)) && !fun.closed) { 
                    existingFunctions[x] = { ...fun, end: i, closed: true };
                }
            });
        }
        if(filteredLine.match(FUNCTION_INVOKED(FUNCTION_NAME_MATCH[0]))) functionCalls.push(i);
    });
    if(!functionCalls.length) { return false; }

    const OPEN_FUNCTIONS = existingFunctions.filter(fun => !fun.closed);
    const IS_INSIDE_FUNCTION: boolean = !!OPEN_FUNCTIONS.length;
    if(IS_INSIDE_FUNCTION) {
        functionCalls = functionCalls.filter(call => call > OPEN_FUNCTIONS[OPEN_FUNCTIONS.length-1].start);
        existingFunctions = existingFunctions.filter(fun => fun.start > OPEN_FUNCTIONS[OPEN_FUNCTIONS.length-1].start);
    }
    return functionCalls.some(call => !existingFunctions.some(fun => fun.start <= call && fun.end >= call));
};

export const isFunctionUsesThis = (lines: string[]): boolean => {
    let isInInnerFun = false, openBrackets = 0, closeBrackets = 0;
    for(let line of lines) {
        if(!isInInnerFun) {  
            const IS_FUNCTION_STARTS = line.match(FUNCTION_NOT_ARROW_DECLARETION);
            if(line.match(THIS_WORD)) return true;
            if(IS_FUNCTION_STARTS) {
                isInInnerFun = true;
                line = line.slice(IS_FUNCTION_STARTS[0].length);
            }
        } 
        if(isInInnerFun) {
            openBrackets += line.match(CURLY_BRACKETS_OPEN_G)?.length || 0;
            closeBrackets += line.match(CURLY_BRACKETS_CLOSE_G)?.length || 0;
            if(!(openBrackets - closeBrackets)) { isInInnerFun = false; }
        }
        
    }
    return false;
};