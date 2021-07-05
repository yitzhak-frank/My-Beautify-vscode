import { isComment } from "../../helpers/match";
import { getAllVariables } from "./get";
import { filterMultilineCommentsToOneLine } from "../../helpers/replace";
import { isNoValueAssign, isScopeEnded, isThereAreMultipleVariables, isVariableValueChange } from "./match";

export const IS_LINE_HAS_FUNCTION_REGEX = /((^| +|\()function\b)|=>/, 
    VARIABLE_NAME_REGEX = /(?<=\b(let|var)\s)(\w+)/,
    constant = { flag: true },
    scopes: { [inner: string]: number, outer: number } = { inner: 0, outer: 0 };

let isInOuterFun: boolean;

const constify = (lines: string[]): string[] => {
    lines = filterMultilineCommentsToOneLine(lines);
    lines.forEach((line, i) => {

        if(!isInOuterFun) { isInOuterFun = !!line.match(IS_LINE_HAS_FUNCTION_REGEX); }

        const declaration = line.match(/^(| +)(let\b|var\b)/);

        if(!declaration || isComment(line)) { return; }

        constant.flag = true;

        let variables: string[];

        if(isThereAreMultipleVariables(line, lines[i+1] || '')) {
            variables = getAllVariables(lines.slice(i, lines.length));
            if(!constant.flag) { return; }
        } else { variables = [(line.match(VARIABLE_NAME_REGEX) || [''])[0]]; }

        if(!variables[0]) { return; }
        if(!(variables.length-1) && isNoValueAssign(line, variables[0])) { return; }

        const LINES_AFTER = lines.slice(i + variables.length, lines.length).filter(line => !line.match(/^( +|)\/\//));
        if(!(variables.length-1)) { LINES_AFTER.unshift(line.substring(line.indexOf('='), line.length)); }
        
        checkLinesAfter(LINES_AFTER, variables);

        if(constant.flag) { 
            lines[i] = line.replace(declaration[0].replace(/ +/, ''), 'const'); 
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
        if(isComment(line)) { continue; }

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

export default constify;