import { constant } from "./main";
import { isComment } from "../../helpers/match";
import { FilteredLine } from "../../interfaces/main";
import { isVariableValueChange } from "./match";
import { COMMA_AT_END, COMMA_OR_EMPTY_LINE, DESTRUCTURE_VARIABLES_G, STRING_AFTER_VAR_OR_LET_WORD, VARIABLE_AUTHORIZED_CHARS, WHITE_SPACE_ONLY } from "../../helpers/regex";

interface BracketsState {
    openBrackets: {         
        [key: string]: number
    }
    closeBrackets: {
        [key: string]: () => void
    }
}

interface VarsState {
    isValue: boolean
    isComma: boolean
    isDestructure: boolean
    isDeclaration: boolean
    value: BracketsState
    destructure: BracketsState
}

let state: VarsState;

const initState = () => {
    state = { 
        isValue: false,
        isComma: false,
        isDestructure: false,
        isDeclaration: true,
        value: {
            openBrackets: {
                '{': 0,
                '[': 0,
                '(': 0
            },
            closeBrackets: {
                '}': () => state.value.openBrackets['{']--,
                ']': () => state.value.openBrackets['[']--,
                ')': () => state.value.openBrackets['(']--
            }
        },
        destructure: {
            openBrackets: {
                '{': 0,
                '[': 0
            },
            closeBrackets: {
                '}': () => state.destructure.openBrackets['{']--,
                ']': () => state.destructure.openBrackets['[']--
            }
        }
    };
};

export const getAllVariables = (lines: FilteredLine[]): { variables: string[], length: number } => { 
    initState();
    const variables: string[] = [];
    let variable: string = '';
    let destructureContent = '';
    let length = 0;

    for(let i = 0; i < lines.length -1; i++) {
        length++;
        const { newStr: filteredLine } = lines[i];
        // If new line starts without comma stop.
        if(!state.isComma && !state.isDestructure && !filteredLine.match(COMMA_OR_EMPTY_LINE) && i) break;
        state.isComma = !!filteredLine.match(COMMA_AT_END);

        if(isComment(filteredLine)) continue;

        // Remove the var/let from the first line.
        let line = i ? filteredLine : (filteredLine.match(STRING_AFTER_VAR_OR_LET_WORD)||[''])[0];
        for(let x = 0; x < line.length; x++) {

            const char = line[x];
            
            if(!state.isValue && !state.isDestructure) {
                if(char === ',' && state.isDeclaration) {
                    constant.flag = false;
                    break;
                }
                if(char.match(VARIABLE_AUTHORIZED_CHARS)) {
                    variable += char;
                    state.isDeclaration = true; 
                } else {
                    if(variable) {
                        variables.push(variable);
                        variable = '';
                    }
                    if(char === '=') { 
                        state.isValue = true; 
                        state.isDeclaration = false; 
                    } 
                    else if(['{','['].includes(char)) {
                        state.isDestructure = true;
                    }
                }
            } else if(!state.isDestructure) {
                const { noBrackets } = bracketsHandler(char, state.value);
                if(noBrackets) { 
                    if(char === ',') state.isValue = false;
                    else if(char === ';') {
                        let afterVars = line.slice(x+1, line.length).replace(WHITE_SPACE_ONLY, ''); 
                        if(afterVars && isVariableValueChange(afterVars, variables)) constant.flag = false;
                        break;
                    }
                } 
            } 
            if(state.isDestructure) {
                destructureContent += char;
                const { noBrackets } = bracketsHandler(char, state.destructure);
                if(noBrackets) state.isDestructure = false;
            } else if(destructureContent) {
                variables.push(...(destructureContent.match(DESTRUCTURE_VARIABLES_G) || []));
                destructureContent = '';
            }
        }
    }
    return { variables, length };
};

const bracketsHandler = (char: string, state: BracketsState): { noBrackets: boolean } => {
    const { openBrackets, closeBrackets } = state;

    const OPEN_BRACKETS = Object.keys(openBrackets);
    const CLOSE_BRACKETS = Object.keys(closeBrackets);

    if(OPEN_BRACKETS.includes(char)) openBrackets[char]++;
    
    const NO_BRACKETS = Object.values(openBrackets).every(type => !type);
    if(!NO_BRACKETS && CLOSE_BRACKETS.includes(char)) closeBrackets[char]();
    return { noBrackets: NO_BRACKETS };
};