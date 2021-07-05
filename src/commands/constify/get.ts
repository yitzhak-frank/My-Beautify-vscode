import { isComment } from "../../helpers/match";
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
        },
        strings: {
            [key: string]: boolean
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
            },
            strings: {
                '"': false,
                "`": false,
                "'": false
            }
        }
    };

    const variables: string[] = [];
    let variable: string = '';

    for(let i = 0; i < lines.length; i++) {
        if(!state.isComma && !lines[i].match(/^( +|)(,|$)/) && i) { break; }
        state.isComma = !!lines[i].match(/,( +|)$/);

        const line = i ? lines[i] : (lines[i].match(/(?<=\b(let|var)\s).*/)||[''])[0];
        if(isComment(lines[i])) { continue; }
        
        for(let x = 0; x < line.length; x++) {

            const char = line[x];
            const { value: { brackets, strings }} = state;

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
                const STRINGS_VAL  = Object.values(strings);
                const BRACKETS_VAL = Object.values(brackets);
                const NO_STRING    = STRINGS_VAL.every(val => !val);
                const NO_BRACKETS  = BRACKETS_VAL.every(type => Array.from(new Set(Object.values(type))).length < 2);

                if(Object.keys(strings).includes(char)) { 
                    if(strings[char] || NO_STRING) {
                        strings[char] = !strings[char]; 
                    }
                } else if(NO_STRING) {
                    const type = BRACKETS_VAL.find(type => Object.keys(type).includes(char));
                    if(type) {
                        type[char] += 1;
                        if(Array.from(new Set(Object.values(type))).length < 2) {
                            for(let i in type) { type[i] = 0; }
                        }
                    }
                } 
                if(NO_STRING && NO_BRACKETS) { 
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