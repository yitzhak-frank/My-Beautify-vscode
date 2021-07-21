import { isComment } from "../../helpers/match";
import { FilteredLine } from "../../interfaces/main";
import { getAllVariables } from "./get";
import { getFilteredLines } from "../../helpers/get";
import { filterMultilineCommentsToOneLine } from "../../helpers/replace";
import { isNoValueAssign, isScopeEnded, isVariableValueChange } from "./match";
import { FUNCTION_DECLARETION, ONE_LINE_COMMENT, ONE_SPACE_OR_MORE_G, VAR_OR_LET_DECLARETION, VAR_OR_LET_VARIABLE_NAME } from "../../helpers/regex";

export const constant = { flag: true };

interface ScopesState {
    scopesVariables: string[][]
    declaretionScope: {
        scopeIndex: number
        scopes: [{ open: number, close: number }]
    },
    valueChangeScope: {
        scopeIndex: number
        scopes: [{ open: number, close: number }]
    }
}

let scopesState: ScopesState;

const constify = (lines: string[]): string[] => {
    initState();
    lines = filterMultilineCommentsToOneLine(lines);
    const FILTERED_LINES: FilteredLine[] = getFilteredLines(lines);

    lines.forEach((line, i) => {

        if(isComment(line)) return;

        const { declaretionScope } = scopesState;

        if(line.match(FUNCTION_DECLARETION)) declaretionScope.scopeIndex++;
        const { scopes, scopeIndex } = declaretionScope;
        scopeIndex && !scopes[scopeIndex -1] && (scopes[scopeIndex -1] = { open: 0, close: 0 });
        if(scopeIndex && isScopeEnded(line, scopes[scopeIndex -1])) declaretionScope.scopeIndex--;

        const declaretion = line.match(VAR_OR_LET_DECLARETION);

        if(!declaretion) return;

        constant.flag = true;

        const variables = getAllVariables(FILTERED_LINES.slice(i, lines.length));
        if(!constant.flag) return;

        if(!variables[0]) return;
        if(!(variables.length-1) && isNoValueAssign(line, variables[0])) return;

        const LINES_AFTER = FILTERED_LINES.slice(i + variables.length, lines.length).filter(line => !line.newStr.match(ONE_LINE_COMMENT));
        if(!(variables.length-1)) LINES_AFTER.unshift(...getFilteredLines([line.substring(line.indexOf('='), line.length)]));
        
        checkLinesAfter(LINES_AFTER, variables);

        if(constant.flag) lines[i] = line.replace(declaretion[0].replace(ONE_SPACE_OR_MORE_G, ''), 'const');
    });

    return lines;
};

const checkLinesAfter = (lines: FilteredLine[], variables: string[]) => {
    const { scopesVariables, valueChangeScope, declaretionScope } = scopesState;
    scopesVariables.splice(0, scopesVariables.length);
    
    for(let line of lines) {
        const { newStr: filteredLine } = line;
        if(isComment(filteredLine)) continue;
        if(filteredLine.match(FUNCTION_DECLARETION)) valueChangeScope.scopeIndex++;

        const { scopes: V_SCOPES, scopeIndex: V_INDEX } = valueChangeScope;
        const { scopes: D_SCOPES, scopeIndex: D_INDEX } = declaretionScope;

        if(D_INDEX && isScopeEnded(filteredLine, D_SCOPES[D_INDEX -1])) { 
            declaretionScope.scopeIndex--; 
            break;
        }
        if(V_INDEX) { 
            !V_SCOPES[V_INDEX -1] && (V_SCOPES[V_INDEX -1] = { open: 0, close: 0 });
            !scopesVariables[V_INDEX -1] && (scopesVariables[V_INDEX -1] = []);
            
            const variable = (filteredLine.match(VAR_OR_LET_VARIABLE_NAME)||[''])[0];
            if(variables.includes(variable)) { 
                scopesVariables[V_INDEX -1].push(variable);
                variables = variables.filter(variable => !scopesVariables[V_INDEX -1].includes(variable));
            }
            if(isScopeEnded(filteredLine, V_SCOPES[V_INDEX -1], variables)) { 
                valueChangeScope.scopeIndex--; 
                variables = (variables.concat((scopesVariables[V_INDEX -1]||[]).filter(variable => !variables.includes(variable))));
                scopesVariables[V_INDEX -1].splice(0, scopesVariables[V_INDEX -1].length);
            }
        }
        if(isVariableValueChange(filteredLine, variables)) break;
    }
};

const initState = () => {
    scopesState = {
        scopesVariables: [],
        declaretionScope: {
            scopeIndex: 0,
            scopes: [{ open: 0, close: 0 }]
        },
        valueChangeScope:{
            scopeIndex: 0,
            scopes: [{ open: 0, close: 0 }]
        }
    };
};

export default constify;