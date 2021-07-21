import { CURLY_BRACKETS_CLOSE_G, CURLY_BRACKETS_OPEN_G, EQUAL_WITH_NO_VALUE_AFTER_VARIABLE, ONE_SPACE_OR_MORE_G, VALUE_ASSIGN_TO_VARIABLE, VARIABLE_EXIST, VARIABLE_VALUE_CHANGE } from "../../helpers/regex";
import { constant } from "./main";

export const isNoValueAssign = (line: string, variable: string): boolean => {
    if(line.match(VALUE_ASSIGN_TO_VARIABLE(variable))) return false;
    else { 
        constant.flag = false;
        return true; 
    }
};

export const isScopeEnded = (line: string, scope: {open: number, close: number}, variables?: string[]): boolean => {
    const openBrackets = (line.match(CURLY_BRACKETS_OPEN_G)||[]).length;
    const closeBrackets = (line.match(CURLY_BRACKETS_CLOSE_G)||[]).length;
    scope.open += openBrackets;
    scope.close += closeBrackets;

    if (scope.open && (scope.close >= scope.open)) { 
        const indexes: number[] = [];
        line.split('').forEach((char: string, i: number) => char === '}' && indexes.push(i));
        if(variables) {
            line = line.slice(0, indexes[closeBrackets - (scope.close - scope.open)]);
            isVariableValueChange(line, variables);
        }
        scope = { open: 0, close: 0 };
        return true; 
    } else return false;
};

export const isVariableValueChange = (line: string, variables: string[]): boolean => {
    for(let variable of variables) {
        if(line.match(VARIABLE_EXIST(variable))) {
            if(
                line.match(VARIABLE_VALUE_CHANGE(variable)) || 
                line.replace(ONE_SPACE_OR_MORE_G, '').match(VARIABLE_VALUE_CHANGE(variable)) || 
                line.match(EQUAL_WITH_NO_VALUE_AFTER_VARIABLE(variable))
            ) { 
                constant.flag = false;
                return true; 
            }
        }
    }
    return false;
};