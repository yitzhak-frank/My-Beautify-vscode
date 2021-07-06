import { isComment } from "../../helpers/match";
import { getAllVariables } from "./get";
import { filterMultilineCommentsToOneLine, filterRegex, filterString } from "../../helpers/replace";
import { isNoValueAssign, isScopeEnded, isVariableValueChange } from "./match";

export const constant = { flag: true };

const IS_LINE_HAS_FUNCTION_REGEX = /((^|\(| |:|\?|=|\||&)function\b)|=>/, VARIABLE_NAME_REGEX = /(?<=\b(let|var)\s)(\w+)/;

let isInOuterFun: boolean;
let state: {
    declaretionScope: {
        declaretionCheck: {
            open: number,
            close: number
        },
        valueChangeCheck: {
            open: number,
            close: number
        }
    },
    valueChangeScope: {
        open: number,
        close: number
    }
};

const constify = (lines: string[]): string[] => {
    initState();
    lines = filterMultilineCommentsToOneLine(lines);
    const FILTERED_LINES = lines.map(line => filterString(filterRegex(line)));

    lines.forEach((line, i) => {

        if(isComment(line)) { return; }

        if(!isInOuterFun && line.match(IS_LINE_HAS_FUNCTION_REGEX)) { 
            isInOuterFun = true; 
            state.declaretionScope.valueChangeCheck.open++;
        }
        if(isInOuterFun && isScopeEnded(line, state.declaretionScope.declaretionCheck)) { isInOuterFun = false; }

        const declaration = line.match(/^(| +)(let\b|var\b)/);

        if(!declaration) { return; }

        constant.flag = true;

        const variables = getAllVariables(FILTERED_LINES.slice(i, lines.length));
        if(!constant.flag) { return; }

        if(!variables[0]) { return; }
        if(!(variables.length-1) && isNoValueAssign(line, variables[0])) { return; }

        const LINES_AFTER = FILTERED_LINES.slice(i + variables.length, lines.length).filter(line => !line.match(/^( +|)\/\//));
        if(!(variables.length-1)) { LINES_AFTER.unshift(line.substring(line.indexOf('='), line.length)); }
        
        checkLinesAfter(LINES_AFTER, variables);

        if(constant.flag) { 
            lines[i] = line.replace(declaration[0].replace(/ +/, ''), 'const'); 
        }
    });

    return lines;
};

const checkLinesAfter = (lines: string[], variables: string[]) => {
    state.valueChangeScope = { open: 0, close: 0 };
    // Is new function starts
    let isInInnerFun: boolean = false;
    // New function variables with the same name as the global variables
    const innerFunVars: string[] = [];

    for(let line of lines) {
        if(isComment(line)) { continue; }

        if(line.match(IS_LINE_HAS_FUNCTION_REGEX)) { isInInnerFun = true; }
        if(isInOuterFun && isScopeEnded(line, state.declaretionScope.valueChangeCheck, variables)) { break; }
        if(isInInnerFun) { 
            const variable = (line.match(VARIABLE_NAME_REGEX)||[''])[0];
            if(variables.includes(variable)) { 
                variables = variables.filter(variable => innerFunVars.includes(variable));
                innerFunVars.push(variable); 
            }
            if(isScopeEnded(line, state.valueChangeScope, variables)) { 
                isInInnerFun = false; 
                variables.push(...innerFunVars);
            } 
        }
        if(isVariableValueChange(line, variables)) { break; }
    }
};

const initState = () => {
    state = {
        declaretionScope: {
            declaretionCheck: {
                open: 0,
                close: 0
            },
            valueChangeCheck: {
                open: 0,
                close: 0
            }
        },
        valueChangeScope: {
            open: 0,
            close: 0
        }
    };
};

export default constify;