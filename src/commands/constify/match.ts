import { constant } from "./main";

export const isNoValueAssign = (line: string, variable: string): boolean => {
    const VALUE_ASSIGN = new RegExp(`( ${variable})(=| +=)`);
    if(line.match(VALUE_ASSIGN)) { return false; }
    else { 
        constant.flag = false;
        return true; 
    }
};

export const isScopeEnded = (line: string, scope: {open: number, close: number}, variables?: string[]): boolean => {
    const openBrackets = (line.match(/{/g)||[]).length, closeBrackets = (line.match(/}/g)||[]).length;
    scope.open += openBrackets;
    scope.close += closeBrackets;

    if (scope.open && (scope.close >= scope.open)) { 
        const indexes: number[] = [];
        line.split('').forEach((char: string, i: number) => {
            if(char === '}') { indexes.push(i); }; 
        });
        if(variables) {
            line = line.slice(0, indexes[closeBrackets - (scope.close - scope.open)]);
            isVariableValueChange(line, variables);
        }
        scope.open = 0;
        scope.close = 0;
        return true; 
    } else { return false; }
};

export const isVariableValueChange = (line: string, variables: string[]): boolean => {
    for(let variable of variables) {
        const VARIABLE_EXIST = new RegExp(`.*([^a-zA-Z0-9]|)${variable}\\b`);

        if(line.match(VARIABLE_EXIST)) {

            const VALUE_CHANGE = new RegExp(`.*([-+]{2}(| +)${variable})|(.*[^.a-zA-Z0-9$_]|^| )(${variable}(| +)((?=[^==])([-*\\/+%=]{2})|(=[^==])))`);
            const ENDS_WITH_EQUAL = new RegExp(`(( |^)${variable})(=|= +| +=| += +)$`);

            if(line.match(VALUE_CHANGE) || line.replace(/ +/g, '').match(VALUE_CHANGE) || line.match(ENDS_WITH_EQUAL)) { 
                constant.flag = false;
                return true; 
            }
        }
    }
    return false;
};