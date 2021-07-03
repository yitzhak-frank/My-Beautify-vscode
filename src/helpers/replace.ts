import { isMultilineCommentEnds, isMultilineCommentStarts } from "./match";

export const removeMultipleSpaces = (line: string): string => {
	let start = '', i = 1;
	while(line[i] === ' ') { start += line[i]; i++; };
	return start + line.replace(/  +/g, ' ');
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