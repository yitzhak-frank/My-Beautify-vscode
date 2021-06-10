let isConstant: boolean, scopes: number, index: number;

const constify = (lines: string[]): string[] => {
    lines.forEach((line, x) => {
        let declaration = /let\b/.exec(line.replace(/var\b/, 'let'));
        if(declaration) {
            isConstant = true;
            index = line.indexOf(declaration[0]) + declaration[0].length;
            const variable = /(?:|(?:[.!?]\s))(\w+)/.exec(line.substring(index, line.length));
            if(!variable) { return; }
            index = line.indexOf(variable[0]) + variable[0].length;

            if(isNoValueAssign(line, variable[0])) { return; }

            scopes = 0;
            const REST_OF_LINE = line.substring(index+1 + line.split('').slice(index).indexOf('='), line.length);
            const linesAfter = [REST_OF_LINE ,...lines.slice(x + 1, lines.length)];
            for(let line of linesAfter) {
                if(isScopeEnded(line, variable[0])) { break; }
                if(isVariableValueChange(line, variable[0])) { break; }
            }
            if(isConstant) { lines[x] = line.replace(declaration[0], 'const'); }
        }
    });

    return lines;
};

const isNoValueAssign = (line: string, variable: string): boolean => {
    const VALUE_ASSIGN = new RegExp(`( ${variable})(=| +=)`);
    if(line.match(VALUE_ASSIGN)) { return false; }
    else { 
        isConstant = false;
        return true; 
    }
};

const isScopeEnded = (line: string, variable: string): boolean => {
    const openBrackets = line.match(/{/g) || [], closeBrackets = line.match(/}/g) || [];
    scopes += (closeBrackets.length - openBrackets.length);

    if (scopes > 0) { 
        const indexes: number[] = [];
        line.split('').forEach((char: string, i: number) => {
            if(char === '}') { indexes.push(i); }; 
        });
        line = line.slice(0, indexes[closeBrackets.length - scopes]);
        isVariableValueChange(line, variable);
        return true; 
    } else { return false; }
};

const isVariableValueChange = (line: string, variable: string): boolean => {

    const VARIABLE_EXIST = new RegExp(`.*([^a-zA-Z0-9]|)${variable}\\b`);

    if(line.match(VARIABLE_EXIST)) {

        const VALUE_CHANGE    = new RegExp(`.*${variable}((?=[^==])([-*\/+%=]{2})|(=[^==]))`);
        const ENDS_WITH_EQUAL = new RegExp(`(( |^)${variable})(=|= +| +=| += +)$`);

        if(line.replace(/ +/g, '').match(VALUE_CHANGE) || line.match(ENDS_WITH_EQUAL)) { 
            isConstant = false;
            return true; 
        }
        return false;
    } else { return false; }
};

export default constify;