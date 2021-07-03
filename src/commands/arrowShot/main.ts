import { isComment } from "../../helpers/match";
import { filterMultilineCommentsToOneLine } from "../../helpers/replace";
import { getFunctionContent, getFunctionLinesNumber } from "./get";
import { assignFunctionToVariable, exportDefaultAndModuleExports, fixSelfInvoking, turnToArrow, turnToOneLine } from "./replace";
import { isAnonymous, isAssignedToVariable, isFunctionCalledBeforeInitialized, isFunctionUsesThis, isOnlyOneLine } from "./match";

export const syntaxFlag: { wrong: boolean } = { wrong: false };

const arrowShot = (lines: string[]): string[] => {
    // Start from the end to be able to turn two functions into one line when nested.
    lines = filterMultilineCommentsToOneLine(lines);
    const length = lines.length;
    lines.map(line => line).reverse().forEach((line, i) => {
        syntaxFlag.wrong = false;
        const index = length - (i+1);

        lines[index] = fixSelfInvoking(line);

        if(
            isComment(line) ||
            !line.match(/(^|[=:,\(?]|return\b|export\b|default\b)(| +)function\b(| +)(|\w+)(| +)\(/g) || 
            (line.match(/function\b/g)?.length || 2) > 1 ||
            line.match(/('|"|&&|\|\||\?)( +|)function\b/)
        ) { return; }

        const FUNCTION_SCOPE_START = line.match(/function\b.*\)( +|){/);
        const FUNCTION_FIRST_LINE = FUNCTION_SCOPE_START ? '{' + line.split(/function\b.*\)( +|){/).pop() : '';
        const {content: FUNCTION_CONTENT, comment: IS_HAS_COMMENTS} = getFunctionContent([FUNCTION_FIRST_LINE, ...lines.slice(index+1)]);
        if(isFunctionUsesThis(FUNCTION_CONTENT.split('\n'))) { return; }

        const EXPORT_DEFAULT = line.match(/^(| +)(export\b +default\b +)/);
        const MODULE_EXPORTS = line.match(/^(| +)(module\b(| +).(| +)exports\b)(| +)=/);
        
        if((EXPORT_DEFAULT || MODULE_EXPORTS) && !line.match(/function\b(| +)\(/)) {
            const length = index + FUNCTION_CONTENT.split('\n').length;
            line = exportDefaultAndModuleExports(index, length, lines, EXPORT_DEFAULT || MODULE_EXPORTS);
        }

        const AFTER_EQUAL = !!lines[index-1]?.match(/[^=]=( +|)$/);
        if(
            line.match(/(^|export\b)(| +)function\b/) && 
            !isAnonymous(line, AFTER_EQUAL) && 
            !isAssignedToVariable(line, AFTER_EQUAL)
        ) { 
            const LINES_BEFORE = lines.slice(0, index).filter(line => !isComment(line));
            if(isFunctionCalledBeforeInitialized(LINES_BEFORE, line)) { return; }
            line = assignFunctionToVariable(line); 
        } else if (!line.match(/function\b(| +)\(/)) {
            line = line.replace(/(?<=\bfunction\s)(\w+)/, '');
        }


        const REST_OF_LINES = lines.slice(index+1, index+1 + FUNCTION_CONTENT.split('\n').length);
        const LINES_CHANGED = turnToArrow(line, REST_OF_LINES);

        if(syntaxFlag.wrong) { return; }

        lines.splice(index, LINES_CHANGED.length, ...LINES_CHANGED);

        if(!IS_HAS_COMMENTS && isOnlyOneLine(FUNCTION_CONTENT)) { 
            lines.splice(index+1, getFunctionLinesNumber(FUNCTION_CONTENT)-1);
            lines[index] = turnToOneLine(FUNCTION_CONTENT, lines[index]);
        };
    });
    return lines;
};

export default arrowShot;