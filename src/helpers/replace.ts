export const removeMultipleSpaces = (line: string): string => {
	let start = '', i = 1;
	while(line[i] === ' ') { start += line[i]; i++; };
	return start + line.replace(/  +/g, ' ');
};