import { isComment, isMultilineCommentEnds, isMultilineCommentStarts } from "../helpers/match";

const 
    IS_LINE_HAS_FUNCTION_REGEX = /((^| +|\()function\b)|=>/, 
    VARIABLE_NAME_REGEX = /(?<=\b(let|var)\s)(\w+)/,
    scopes: { [inner: string]: number, outer: number } = { inner: 0, outer: 0 };
let 
    isConstant: boolean, 
    comment: boolean, 
    isInOuterFun: boolean;

const constify = (lines: string[]): string[] => {
    lines.forEach((line, x) => {

        if(!isInOuterFun) { isInOuterFun = !!line.match(IS_LINE_HAS_FUNCTION_REGEX); }

        const declaration = line.match(/^(| +)(let\b|var\b)/);

        if(isMultilineCommentStarts(line)) { comment = true; }
        if(isMultilineCommentEnds(line)) { comment = false; }

        if(!declaration || comment || isComment(line)) { return; }

        isConstant = true;

        let variables: string[];

        if(isThereAreMultipleVariables(line, lines[x+1] || '')) {
            variables = getAllVariables(lines.slice(x, lines.length));
            if(!isConstant) { return; }
        } else { variables = [(line.match(VARIABLE_NAME_REGEX) || [''])[0]]; }

        if(!variables[0]) { return; }
        if(!(variables.length-1) && isNoValueAssign(line, variables[0])) { return; }

        const LINES_AFTER = lines.slice(x + variables.length, lines.length).filter(line => !line.match(/^( +|)\/\//));
        if(!(variables.length-1)) { LINES_AFTER.unshift(line.substring(line.indexOf('='), line.length)); }
        
        checkLinesAfter(LINES_AFTER, variables);

        if(isConstant) { 
            lines[x] = line.replace(declaration[0].replace(/ +/, ''), 'const'); 
        }
    });

    return lines;
};

const checkLinesAfter = (lines: string[], variables: string[]) => {
    scopes.inner = 0;
    // Is new function starts
    let isInInnerFun: boolean = false;
    // New function variables with the same name as the global variables
    const innerFunVars: string[] = [];

    for(let line of lines) {
        if(isMultilineCommentStarts(line)) { comment = true; }
        if(isMultilineCommentEnds(line)) { comment = false; }
    
        if(comment || isComment(line)) { continue; }

        if(line.match(IS_LINE_HAS_FUNCTION_REGEX)) { isInInnerFun = true; }
        if(isInOuterFun) { 
            if(isScopeEnded(line, 'outer', variables)) { 
                isInOuterFun = false;
                scopes.outer = 0;
                continue; 
            } 
        }
        if(isInInnerFun) { 
            const variable = (line.match(VARIABLE_NAME_REGEX)||[''])[0];
            if(variables.includes(variable)) { 
                variables = variables.filter(variable => innerFunVars.includes(variable));
                innerFunVars.push(variable); 
            }
            if(isScopeEnded(line, 'inner', variables)) { 
                isInInnerFun = false; 
                variables.push(...innerFunVars);
            } 
        }
        if(isVariableValueChange(line, variables)) { break; }
    }
};

const isNoValueAssign = (line: string, variable: string): boolean => {
    const VALUE_ASSIGN = new RegExp(`( ${variable})(=| +=)`);
    if(line.match(VALUE_ASSIGN)) { return false; }
    else { 
        isConstant = false;
        return true; 
    }
};

const isScopeEnded = (line: string, scope: string, variables: string[]): boolean => {
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

const isVariableValueChange = (line: string, variables: string[]): boolean => {
    for(let variable of variables) {
        const VARIABLE_EXIST = new RegExp(`.*([^a-zA-Z0-9]|)${variable}\\b`);

        if(line.match(VARIABLE_EXIST)) {

            const VALUE_CHANGE = new RegExp(`.*([-+]{2}(| +)${variable})|(.*[^.a-zA-Z0-9$_]|^| )(${variable}(| +)((?=[^==])([-*\\/+%=]{2})|(=[^==])))`);
            const ENDS_WITH_EQUAL = new RegExp(`(( |^)${variable})(=|= +| +=| += +)$`);

            if(line.match(VALUE_CHANGE) || line.replace(/ +/g, '').match(VALUE_CHANGE) || line.match(ENDS_WITH_EQUAL)) { 
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