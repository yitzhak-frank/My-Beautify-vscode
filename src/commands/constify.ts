import { isComment, isMultilineCommentEnds, isMultilineCommentStarts } from "../helpers/match";

let isConstant: boolean, scopes: number, comment: boolean;

const constify = (lines: string[]): string[] => {
    lines.forEach((line, x) => {
        const declaration = line.match(/^(| +)(let\b|var\b)/);

        if(isMultilineCommentStarts(line)) { comment = true; }
        if(isMultilineCommentEnds(line)) { comment = false; }

        if(!declaration || comment || isComment(line)) { return; }

        isConstant = true;

        let variables: string[];

        if(isThereAreMultipleVariables(line, lines[x+1] || '')) {
            variables = getAllVariables(lines.slice(x, lines.length));
            if(!isConstant) { return; }
        } else { variables = [(line.match(/(?<=\b(let|var)\s)(\w+)/) || [''])[0]]; }

        if(!variables[0]) { return; }
        if(!(variables.length-1) && isNoValueAssign(line, variables[0])) { return; }

        const LINES_AFTER = lines.slice(x + variables.length, lines.length);
        if(!(variables.length-1)) { LINES_AFTER.unshift(line.substring(line.indexOf('='), line.length)); }

        scopes = 0;
        
        for(let line of LINES_AFTER) {
            if(isScopeEnded(line, variables)) { break; }
            if(isVariableValueChange(line, variables)) { break; }
        }
        if(isConstant) { 
            lines[x] = line.replace(declaration[0].replace(/ +/, ''), 'const'); 
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

const isScopeEnded = (line: string, variables: string[]): boolean => {
    const openBrackets = line.match(/{/g) || [], closeBrackets = line.match(/}/g) || [];
    scopes += (closeBrackets.length - openBrackets.length);

    if (scopes > 0) { 
        const indexes: number[] = [];
        line.split('').forEach((char: string, i: number) => {
            if(char === '}') { indexes.push(i); }; 
        });
        line = line.slice(0, indexes[closeBrackets.length - scopes]);
        isVariableValueChange(line, variables);
        return true; 
    } else { return false; }
};

const isVariableValueChange = (line: string, variables: string[]): boolean => {
    for(let variable of variables) {
        const VARIABLE_EXIST = new RegExp(`.*([^a-zA-Z0-9]|)${variable}\\b`);

        if(line.match(VARIABLE_EXIST)) {

            const VALUE_CHANGE    = new RegExp(`.*([-+]{2}(| +)${variable})|(${variable}(| +)((?=[^==])([-*\/+%=]{2})|(=[^==])))`);
            const ENDS_WITH_EQUAL = new RegExp(`(( |^)${variable})(=|= +| +=| += +)$`);

            if(line.replace(/ +/g, '').match(VALUE_CHANGE) || line.match(ENDS_WITH_EQUAL)) { 
                isConstant = false;
                return true; 
            }
        }
    }
    return false;
};

const isThereAreMultipleVariables = (line: string, next: string): boolean => {
    if(!line.match(/,(?![^(]*\))/g) && !next.match(/^(| +),/)) { return false; }
    return true;
};

const getAllVariables = (lines: string[]): string[] => {
    let variables: string = '';
    for(let i = 0; i < lines.length; i++) {
        if(!i || lines[i].match(/^(| +)$/) || lines[i].match(/,(?![^(]*\))/g) || lines[i-1] || ''.match(/,(| +)$/)) { 
            variables += lines[i] + '\n'; 
        } else { break; }
    }
    // Check if value assign to all variables
    const names = variables.match(/(?<=(((\n|,|var\b|let\b)(| +)))\s)(\w+)/g);
    if((variables.match(/(?<=(((\n|,|var\b|let\b)(| +)))\s)(\w+)(| +)(|\n)=/g)?.length || 0) < (names?.length || 1)) {
        isConstant = false;
    }
    return names || [];
};

export default constify;