import { constant, scopes } from "./main";

export const isNoValueAssign = (line: string, variable: string): boolean => {
    const VALUE_ASSIGN = new RegExp(`( ${variable})(=| +=)`);
    if(line.match(VALUE_ASSIGN)) { return false; }
    else { 
        constant.flag = false;
        return true; 
    }
};

export const isScopeEnded = (line: string, scope: string, variables: string[]): boolean => {
    const openBrackets = line.match(/{/g) || [], closeBrackets = line.match(/}/g) || [];
    scopes[scope] += (closeBrackets.length - openBrackets.length);

    if (scopes[scope] >= 0) { 
        const indexes: number[] = [];
        line.split('').forEach((char: string, i: number) => {
            if(char === '}') { indexes.push(i); }; 
        });
        line = line.slice(0, indexes[closeBrackets.length - scopes[scope]]);
        isVariableValueChange(line, variables);
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

export const isThereAreMultipleVariables = (line: string, next: string): boolean => !(!line.match(/,(?![^(]*\))/g) && !next.match(/^(| +),/));
