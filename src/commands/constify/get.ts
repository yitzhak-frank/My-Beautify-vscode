import { constant } from "./main";
import { isComment } from "../../helpers/match";
import { isVariableValueChange } from "./match";
import { COMMA_AT_END, COMMA_OR_EMPTY_LINE, STRING_AFTER_VAR_OR_LET_WORD, VARIABLE_AUTHORIZED_CHARS, WHITE_SPACE_ONLY } from "../../helpers/regex";
import { FilteredLine } from "../../interfaces/main";

interface VarsState {
    isValue: boolean
    isComma: boolean
    isDeclaration: boolean
    value: {
        activeBrackets: string
        openBrackets: {         
            [key: string]: number
        }
        closeBrackets: {
            [key: string]: () => void
        }
    }
}

let state: VarsState;

const initState = () => {
    state = { 
        isValue: false,
        isComma: false,
        isDeclaration: true,
        value: {
            activeBrackets: '',
            openBrackets: {
                '{': 0,
                '[': 0,
                '(': 0
            },
            closeBrackets: {
                '}': () => state.value.activeBrackets === '{' && state.value.openBrackets['{']--,
                ']': () => state.value.activeBrackets === '[' && state.value.openBrackets['[']--,
                ')': () => state.value.activeBrackets === '(' && state.value.openBrackets['(']--
            }
        }
    };
};

export const getAllVariables = (lines: FilteredLine[]): string[] => { 
    initState();
    const variables: string[] = [];
    let variable: string = '';

    for(let i = 0; i < lines.length -1; i++) {
        const { newStr: filteredLine } = lines[i];
        // If new line starts without comma stop.
        if(!state.isComma && !filteredLine.match(COMMA_OR_EMPTY_LINE) && i) break;
        state.isComma = !!filteredLine.match(COMMA_AT_END);

        if(isComment(filteredLine)) continue;

        // Remove the var/let from the first line.
        let line = i ? filteredLine : (filteredLine.match(STRING_AFTER_VAR_OR_LET_WORD)||[''])[0];
        for(let x = 0; x < line.length; x++) {

            const char = line[x];

            if(!state.isValue) {
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
                }
            } else {
                const { value: { openBrackets, closeBrackets }} = state;
                const OPEN_BRACKETS = Object.keys(openBrackets);
                const CLOSE_BRACKETS = Object.keys(closeBrackets);

                if(OPEN_BRACKETS.includes(char)) {
                    openBrackets[char]++;
                    state.value.activeBrackets = char;
                }
                const NO_BRACKETS = Object.values(openBrackets).every(type => !type);
                if(NO_BRACKETS) { 
                    state.value.activeBrackets = '';
                    if(char === ',') state.isValue = false;
                    else if(char === ';') {;
                        let afterVars = line.slice(x+1, line.length).replace(WHITE_SPACE_ONLY, ''); 
                        if(afterVars && isVariableValueChange(afterVars, variables)) constant.flag = false;
                        break;
                    }
                } else if(CLOSE_BRACKETS.includes(char)) closeBrackets[char]();
            }
        }
    }
    return variables;
};