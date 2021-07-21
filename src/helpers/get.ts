import { FilteredLine } from '../interfaces/main';
import { filterRegex, filterString } from './replace';
import { REGEX_PLACEHOLDER_G, STRING_PLACEHOLDER_G } from './regex';
import { isComment } from './match';

export const getFilteredLines = (lines: string[]): FilteredLine[] => {
    const FILTERED_LINES: FilteredLine[] = lines.map(line => {
        if(isComment(line)) return { newStr: '', str: '', strings: [], regexs: [] };
        const FILTER_REGEX = filterRegex(line);
        const FILTER_STRING = filterString(FILTER_REGEX.newStr);
        return { ...FILTER_REGEX, ...FILTER_STRING, str: line };
    });
    return FILTERED_LINES;
};

export const getOriginalLine = (line: FilteredLine): string => line.newStr.replace(REGEX_PLACEHOLDER_G, match => match.replace(match, line.regexs.shift() || '')).replace(STRING_PLACEHOLDER_G, match => match.replace(match, line.strings.shift() || ''));