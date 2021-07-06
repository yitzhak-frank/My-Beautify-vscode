import { isMultilineCommentEnds, isMultilineCommentStarts } from "./match";

export const removeMultipleSpaces = (line: string): string => {
	let start = (line.match(/^ +/)||[''])[0];
	return start + line.replace(/^ +/, '').replace(/  +/g, ' ');
};

export const filterMultilineCommentsToOneLine = (lines: string[]): string[] => {
	const newLines: string[] = [];
	let comment: boolean = false;
	let newLine: string = '';

	lines.forEach(line => {
		if(isMultilineCommentStarts(line)) { comment = true; }
		if(isMultilineCommentEnds(line)) { comment = false; }
		newLine += newLine ? '\n' + line : line;
		if(!comment) { 
			newLines.push(newLine);
			newLine = '';
		}
	});

	return newLines;
};

export const addEscape = (str: string) => str.replace(/\(|\)|\+|\||\[|\]|\*|\.\?\!|\$|\:/g, (match: string): string => `\\${match}`);

interface Strings { [key: string]: boolean; };

export const filterString = (str: string): string => {
	const stringStarts: Strings = { '"': false, "'": false, "`": false };
	let newStr: string = '';
	for(let i = 0; i < str.length; i++) {
		if(stringStarts[str[i]]) { stringStarts[str[i]] = false; }
		else if(Object.keys(stringStarts).includes(str[i])) { 
			stringStarts[str[i]] = true; 
			newStr += str[i];
		}
		if(Object.values(stringStarts).some(val => val)) { continue; }
		newStr += str[i];
	}
	return newStr;
};

export const filterRegex = (str: string): string => {
	const IS_STR_CONTAINS_REGEX = str.match(/(?<==|\||\+|\?|:|,|^|&| )\/[^\/]+(\/)/g);
	if(IS_STR_CONTAINS_REGEX) { 
		IS_STR_CONTAINS_REGEX.forEach(match => str = str.replace(match, '_$_REGEX_$_')); 
	}
	return str;
};