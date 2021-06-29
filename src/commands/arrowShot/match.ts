export const isAnonymous = (line: string, isAssign: boolean) => !isAssign && !line.match(/=( +|)function\b/) && line.match(/function\b(\(| +\()/);

export const isAssignedToVariable = (line: string, isAssign: boolean) => isAssign || line.match(/(const|let|var)(| +)=( +|)function\b/);

export const isOneParameterOnly = (line: string): boolean => !line.match(/,/g) && !((line.match(/\(/g)?.length || 2) > 1) && !line.match(/\(( +|)\)/);

export const isFunctionCalledBeforeInitialized = (lines: string[], line: string): boolean => {
    const FUNCTION_NAME = line.match(/(?<=\bfunction\s)(\w+)/);
    if(!FUNCTION_NAME) { return false; }

    let existingFunctions: {start: number, end: number, openBrackets: number, closeBrackets: number, closed: boolean}[] = [];
    let functionCalls: number[] = [];

    lines.forEach((line, i) => {
        const IS_FUNCTION_STARTS = line.match((/(.*[^.a-zA-Z0-9$_]|^| )(function\b|=>)/));
        if(IS_FUNCTION_STARTS) { 
            const ONE_LINE_FUNCTION = line.match(/(.*[^.a-zA-Z0-9$_]|^| )=>(| +)[^{]/);
            if(ONE_LINE_FUNCTION) { 
                existingFunctions.push({start: i, end: i, closed: true, openBrackets: 0, closeBrackets: 0});
            } else {
                existingFunctions.push({start: i, end: -1, closed: false, openBrackets: 0, closeBrackets: 0});
                line = line.slice(IS_FUNCTION_STARTS.index, line.length);
            }
        }
        const IS_INSIDE_FUNCTION: boolean = existingFunctions.some(fun => !fun.closed);
        if(IS_INSIDE_FUNCTION) {
            existingFunctions.forEach((fun, x) => {
                if(!fun.closed) {
                    existingFunctions[x].openBrackets += line.match(/{/g)?.length || 0;
                    existingFunctions[x].closeBrackets += line.match(/}/g)?.length || 0;
                }
                if((fun.openBrackets && !(fun.openBrackets - fun.closeBrackets)) && !fun.closed) { 
                    existingFunctions[x] = { ...fun, end: i, closed: true };
                }
            });
        }
        const FUNCTION_CALLED_REGEX = new RegExp(`(.*[^.a-zA-Z0-9$_]|^| )${FUNCTION_NAME[0]}\\b`);
        if(line.match(FUNCTION_CALLED_REGEX)) { functionCalls.push(i); }
    });
    if(!functionCalls.length) { return false; }

    const OPEN_FUNCTIONS = existingFunctions.filter(fun => !fun.closed);
    const IS_INSIDE_FUNCTION: boolean = !!OPEN_FUNCTIONS.length;
    if(IS_INSIDE_FUNCTION) {
        functionCalls = functionCalls.filter(call => call > OPEN_FUNCTIONS[OPEN_FUNCTIONS.length-1].start);
        existingFunctions = existingFunctions.filter(fun => fun.start > OPEN_FUNCTIONS[OPEN_FUNCTIONS.length-1].start);
    }
    return functionCalls.some(call => !existingFunctions.some(fun => fun.start <= call && fun.end >= call));
};

export const isFunctionUsesThis = (lines: string[]): boolean => {
    let isInInnerFun = false, openBrackets = 0, closeBrackets = 0;
    for(let line of lines) {
        if(!isInInnerFun) {  
            const IS_FUNCTION_STARTS = line.match(/(.*[^.a-zA-Z0-9$_]|^| )function\b/);
            if(line.match(/(.*[^.a-zA-Z0-9$_]|^| )this\b/g)) { return true; }
            if(IS_FUNCTION_STARTS) {
                isInInnerFun = true;
                line = line.slice(IS_FUNCTION_STARTS[0].length);
            }
        } 
        if(isInInnerFun) {
            openBrackets += line.match(/{/g)?.length || 0;
            closeBrackets += line.match(/}/g)?.length || 0;
            if(!(openBrackets - closeBrackets)) { isInInnerFun = false; }
        }
        
    }
    return false;
};

export const isOnlyOneLine = (content: string): boolean => {
    const lines = content.split('\n').filter(line => !!line.match(/.*[^ ]/));
    if(lines.length !== 3) { return false; }
    if(
        lines[0].replace(/ +/g, '').length > 1 ||
        lines[1].match(/^(| +)(if\b|for\b|while\b|switch\b)/) || 
        !lines[2].replace(/ +/g, '').match(/^\}()|\);\}\)$/)
    ) { return false; }
    return true;
};