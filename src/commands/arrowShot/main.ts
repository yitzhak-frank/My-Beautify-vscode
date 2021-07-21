import { isComment } from "../../helpers/match";
import { FilteredLine } from "../../interfaces/main";
import { getFilteredLines } from "../../helpers/get";
import { filterMultilineCommentsToOneLine } from "../../helpers/replace";
import { getFunctionContent, getFunctionLinesNumber } from "./get";
import { assignFunctionToVariable, exportDefaultAndModuleExports, fixSelfInvoking, turnToArrow, turnToOneLine } from "./replace";
import { isAnonymous, isAssignedToVariable, isFunctionCalledBeforeInitialized, isFunctionUsesThis, isOnlyOneLine } from "./match";
import { ANONYMOUS_FUNCTION, EQUAL_AT_END, EXPORT_DEFAULT, FUNCTION_AFTER_LOGICAL_OPERATORS, FUNCTION_AT_START, FUNCTION_NAME, FUNCTION_NOT_ARROW_DECLARETION, FUNCTION_SCOPE_START, LINE_BREAKS_G, MODULE_EXPORTS, MULTIPLE_FUNCTIONS_NOT_ARROW_G } from "../../helpers/regex";

export const syntax: { flag: boolean } = { flag: false };

const arrowShot = (lines: string[]): string[] => {
    // Start from the end to be able to turn two functions into one line when nested.
    lines = filterMultilineCommentsToOneLine(lines);
    const FILTERED_LINES: FilteredLine[] = getFilteredLines(lines);
    const length = lines.length;

    lines.map(line => line).reverse().forEach((line, i) => {

        syntax.flag = false;
        const index = length - (i+1);
        const { newStr: filteredLine } = FILTERED_LINES[index];

        lines[index] = fixSelfInvoking(line);

        if(
            isComment(line) ||
            !filteredLine.match(FUNCTION_NOT_ARROW_DECLARETION) || 
            (filteredLine.match(MULTIPLE_FUNCTIONS_NOT_ARROW_G)?.length || 2) > 1
        ) return;

        const IS_AFTER_LOGICAL_OPERATORS = filteredLine.match(FUNCTION_AFTER_LOGICAL_OPERATORS);

        const FUNCTION_FIRST_LINE = filteredLine.match(FUNCTION_SCOPE_START) ? '{' + line.split(FUNCTION_SCOPE_START).pop() : '';
        let { content: FUNCTION_CONTENT, comment: IS_HAS_COMMENTS } = getFunctionContent([FUNCTION_FIRST_LINE, ...lines.slice(index+1)]);
        if(IS_AFTER_LOGICAL_OPERATORS) FUNCTION_CONTENT += ')';
        if(isFunctionUsesThis(FUNCTION_CONTENT.split(LINE_BREAKS_G))) return;

        const IS_EXPORT_DEFAULT = filteredLine.match(EXPORT_DEFAULT);
        const IS_MODULE_EXPORTS = filteredLine.match(MODULE_EXPORTS);
        
        if((IS_EXPORT_DEFAULT || IS_MODULE_EXPORTS) && !filteredLine.match(ANONYMOUS_FUNCTION)) {
            const length = index + FUNCTION_CONTENT.split(LINE_BREAKS_G).length;
            line = exportDefaultAndModuleExports(index, length, lines, IS_EXPORT_DEFAULT || IS_MODULE_EXPORTS);
        }
        const AFTER_EQUAL = !!lines[index-1]?.match(EQUAL_AT_END);
        if(
            line.match(FUNCTION_AT_START) && 
            !isAnonymous(filteredLine, AFTER_EQUAL) && 
            !isAssignedToVariable(filteredLine, AFTER_EQUAL)
        ) { 
            const LINES_BEFORE = FILTERED_LINES.slice(0, index);
            if(isFunctionCalledBeforeInitialized(LINES_BEFORE, filteredLine)) return;
            line = assignFunctionToVariable(line); 
        } else if (!filteredLine.match(ANONYMOUS_FUNCTION)) line = line.replace(FUNCTION_NAME, '');

        const REST_OF_LINES = lines.slice(index+1, index+1 + FUNCTION_CONTENT.split(LINE_BREAKS_G).length);
        const LINES_CHANGED = turnToArrow(line, REST_OF_LINES, !!IS_AFTER_LOGICAL_OPERATORS);

        if(syntax.flag) return;

        lines.splice(index, LINES_CHANGED.length, ...LINES_CHANGED);

        if(!IS_HAS_COMMENTS && isOnlyOneLine(FUNCTION_CONTENT)) { 
            lines.splice(index+1, getFunctionLinesNumber(FUNCTION_CONTENT)-1);
            lines[index] = turnToOneLine(FUNCTION_CONTENT, lines[index]);
        };
    });
    return lines;
};

export default arrowShot;