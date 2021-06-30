import { isComment } from "../../helpers/match";
import { syntaxFlag } from "./main";

export const getFunctionLinesNumber = (content: string): number => content.split('\n').length;

export const getFunctionArgs = (lines: string[]): {args: string, after: string} => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let functionArgs: string = '';
    let afterArgs: string = '';

    for(let line of lines) {
        let index = 0;
        while(line[index]) {
            if(line[index] === '(') { openBrackets++; } 
            else if(line[index] === ')') { closeBrackets++; }
            functionArgs += line[index];
            index++;
            if(closeBrackets && (closeBrackets === openBrackets)) { 
                afterArgs = line.substring(index, line.length);
                break; 
            }
        }
        if(closeBrackets && (closeBrackets === openBrackets)) { break; }
        functionArgs += '\n';
    }
    if(openBrackets - closeBrackets) { syntaxFlag.wrong = true; }
    return { args: functionArgs, after: afterArgs};
};

export const getFunctionContent = (lines: string[]): {content: string, comment: boolean} => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    let content: string = '';
    let comment: boolean = false;

    for(let line of lines) {

        if(isComment(line)) {
            const br = line.match(/\n/g); 
            content += br ? br.join('') + '\n' : '\n';
            comment = true;
            continue; 
        }

        for(let i = 0; i < line.length; i++) {
            if(line[i] === '{') { openBrackets++; }
            else if(line[i] === '}') { closeBrackets++; }
            content += line[i];
            if(closeBrackets && (openBrackets === closeBrackets)) { 
                const rest = line.substring(i+1, line.length).match(/^.*[^a-zA-Z0-9$_]/);
                if(rest) { content += rest[0]; }
                break; 
            }
        };
        if(closeBrackets && (openBrackets === closeBrackets)) { break; }
        content += '\n';
    }
    if(openBrackets - closeBrackets) { syntaxFlag.wrong = true; }
    return { content, comment};
};

export const getFunctionCloseBracketsIndex = (content: string): number => {
    let openBrackets: number = 0;
    let closeBrackets: number = 0;
    for(let i = 0; i < content.length; i++) {
        (content[i] === '{' && openBrackets++) || (content[i] === '}' && closeBrackets++);
        if(openBrackets && !(openBrackets - closeBrackets)) {
            return i;
        }
    }
    return -1;
};