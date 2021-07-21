import { isMultilineCommentEnds, isMultilineCommentStarts } from "./match";
import { CHARS_NEEDS_ESCAPE_G, REGEX_CONTENT_G, TWO_SPACE_OR_MORE_G, WHITE_SPACE_AT_START } from "./regex";

export const removeMultipleSpaces = (line: string): string => {
	let start = (line.match(WHITE_SPACE_AT_START)||[''])[0];
	return start + line.replace(WHITE_SPACE_AT_START, '').replace(TWO_SPACE_OR_MORE_G, ' ');
};

export const filterMultilineCommentsToOneLine = (lines: string[]): string[] => {
	const newLines: string[] = [];
	let comment: boolean = false;
	let newLine: string = '';

	lines.forEach(line => {
		if(isMultilineCommentStarts(line)) comment = true;
		if(isMultilineCommentEnds(line)) comment = false;
		newLine += newLine ? '\n' + line : line;
		if(!comment) { 
			newLines.push(newLine);
			newLine = '';
		}
	});

	return newLines;
};

export const addEscape = (str: string) => str.replace(CHARS_NEEDS_ESCAPE_G, (match: string): string => `\\${match}`);

export const filterString = (str: string): { newStr: string, strings: string[] } => {
	const stringStarts: { [key: string]: boolean; } = { '"': false, "'": false, "`": false };
	const strings: string[] = [];
	let stringIndex = -1;
	let newStr: string = '';
	for(let i = 0; i < str.length; i++) {
		const IS_STRING_SIGN = Object.keys(stringStarts).includes(str[i]);
		const NO_STRING_START = Object.values(stringStarts).every(val => !val);
		
		if(stringStarts[str[i]] && (str[i-1] !== '\\')) stringStarts[str[i]] = false;
		else if(IS_STRING_SIGN && NO_STRING_START) { 
			stringStarts[str[i]] = true; 
			newStr += '_$_STRING_$_';
			stringIndex++;
			strings[stringIndex] = '';
		}
		if(NO_STRING_START && !IS_STRING_SIGN) newStr += str[i];
		else strings[stringIndex] += str[i];
	}
	return { newStr, strings };
};

export const filterRegex = (str: string): { newStr: string, regexs: string[] } => {
	const IS_STR_CONTAINS_REGEX = str.match(REGEX_CONTENT_G);
	const regexs: string[] = [];
	if(IS_STR_CONTAINS_REGEX) { 
		IS_STR_CONTAINS_REGEX.forEach(match => {
			str = str.replace(match, '_$_REGEX_$_');
			regexs.push(match);
		}); 
	}
	return { newStr: str, regexs };
};