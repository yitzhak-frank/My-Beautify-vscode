import { isComment } from "../../helpers/match";
import { filterRegex } from "../../helpers/replace";
import { constant } from "./main";
import { isVariableValueChange } from "./match";

interface VarsState {
    isValue: boolean,
    isComma: boolean,
    isDeclaration: boolean,
    value: {
        brackets: {
            round: {
                [key: string]: number
            },
            square: {
                [key: string]: number
            },
            curly: {
                [key: string]: number
            }
        }
    }
}

export const getAllVariables = (lines: string[]): string[] => { 
    const state: VarsState = { 
        isValue: false,
        isComma: false,
        isDeclaration: true,
        value: {
            brackets: {
                round: {'(': 0,')': 0 }, 
                curly: {'{': 0,'}': 0 }, 
                square: {'[': 0,']': 0 }
            }
        }
    };

    const variables: string[] = [];
    let variable: string = '';

    for(let i = 0; i < lines.length; i++) {
        // If new line starts without comma stop.
        if(!state.isComma && !lines[i].match(/^( +|)(,|$)/) && i) { break; }
        state.isComma = !!lines[i].match(/,( +|)$/);

        if(isComment(lines[i])) { continue; }

        // Remove the var/let from the first line.
        let line = i ? lines[i] : (lines[i].match(/(?<=\b(let|var)\s).*/)||[''])[0];
        
        // If line has regex dont calculate the brackets and strings in it.
        line = filterRegex(line);

        for(let x = 0; x < line.length; x++) {

            const char = line[x];
            const { value: { brackets }} = state;

            if(!state.isValue) {
                if(char === ',' && state.isDeclaration) {
                    constant.flag = false;
                    break;
                }
                if(char.match(/[a-zA-Z0-9_$]/)) {
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
                const BRACKETS_VAL = Object.values(brackets);
                const NO_BRACKETS  = BRACKETS_VAL.every(type => Array.from(new Set(Object.values(type))).length < 2);

                if(NO_BRACKETS) { 
                    if(char === ',') { 
                        state.isValue = false; 
                    }
                    if(char === ';') {
                        let afterVars = line.slice(x+1, line.length).replace(/^ +$/, ''); 
                        if(afterVars && isVariableValueChange(afterVars, variables)) { constant.flag = false; }
                        break;
                    }
                }
            }
        }
    }
    return variables;
};