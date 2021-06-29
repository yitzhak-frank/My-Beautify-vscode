import { getFunctionArgs } from "./get";
import { syntaxFlag } from "./main";
import { isOneParameterOnly } from "./match";

export const fixSelfInvoking = (line: string): string => line.replace(/\}( +|)\(( +|)\)( +|)\)/, '})()');

export const assignFunctionToVariable = (line: string): string => {
    if(line.match(/=( +|)function\b/)) { return line; }
    const FUNCTION_NAME = line.match(/(?<=\bfunction\s)(\w+)/);
    if(!FUNCTION_NAME) { 
        syntaxFlag.wrong = true;
        return line; 
    }
    return line.replace(new RegExp(`function\\b +${FUNCTION_NAME[0]}`), `const ${FUNCTION_NAME[0]} = function`);
};

export const turnToArrow = (line: string, lines: string[]): string[] => {
    const FUNCTION = line.match(/function\b( +|)/);

    if(!FUNCTION) { syntaxFlag.wrong = true; }
    if(syntaxFlag.wrong) { return [line]; }

    let index = ((FUNCTION||[])[0]).length + ((FUNCTION||[]).index || 0);
    let { args, after } = getFunctionArgs([line.substring(index, line.length), ...lines]);

    const ARGS_REGEX = args.split('').map(char => '()[]{}<>$-=/*.?!'.includes(char) ? '\\' + char : char).join('');
    const ARGS_LINES = ARGS_REGEX.split('\n');
    
    if(isOneParameterOnly(args)) { 
        args = args.substring(1, args.length -1); 
    }
    // For bug found.
    if(ARGS_REGEX === '\\' || args === '\\') { return [line]; }

    const CHANGES = line.replace(new RegExp(`function\\b( +|)${ARGS_LINES[0]}.*$`), `${args} =>${after}`);
    const LINES_CHANGED = CHANGES.split('\n');
    return [...LINES_CHANGED];
};

export const turnToOneLine = (content: string, line: string) => {
    const lines = content.replace(/( +|^)return\b/, '').split('\n').filter(line => !!line.match(/.*[^ ]/));
    const close = lines[2].replace(/\}/, '').replace(/ /g, '');

    content = close ? lines[1].replace(/;(| +)$/,'') + close : lines[1];

    if(content.match(/^(| +)\{/)) { content = `(${content.replace(/^  +/, ' ').replace(/;/, '')});`; }
    return `${line.split('=>')[0]}=>${content.replace(/^  +/, ' ')};`.replace(/;+/, ';');
};

export const exportDefaultAndModuleExports = (index: number, length: number, lines: string[], exports: RegExpMatchArray | null): string => {
    if(!exports) { return lines[index]; }
    lines[index] = lines[index].substring((exports.index || 0) + exports[0].length, lines[index].length).replace(/^ +/, '');
    lines.splice(length, 0, `\n${exports[0]} ${(lines[index].match(/(?<=\bfunction\s)(\w+)/)||[''])[0]};`.replace(/  +/, ' '));
    return lines[index];
};
