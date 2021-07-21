import { FIRST_EQUAL, FIRST_EQUAL_AND_STRING_AFTER, FUNCTION_DECLARETION, VARIABLE_DECLARETION } from "../helpers/regex";
import { removeMultipleSpaces } from "../helpers/replace";

const spaceify = (lines: string[]): string[] => {
	let longest: number = 0;
	let group: string[] = [];
	
	lines.forEach((line, i) => {
		if(line.match(VARIABLE_DECLARETION) && !line.match(FUNCTION_DECLARETION)) {

			line = removeMultipleSpaces(line.replace(FIRST_EQUAL, ' = '));

			let length: number = line.split(FIRST_EQUAL)[0].length;
			length > longest ? longest = length : null;

			group.push(line);
		} else {
			if(group.length > 1) {
				group.forEach((variable, x) => {
					if(variable.endsWith('')) return;
					
					let parts: string[] = variable.split(FIRST_EQUAL_AND_STRING_AFTER);
					let length: number  = parts[0].length;

					for(let i = 0; i < longest - length; i++) parts[0] += ' ';

					variable = parts[0] + '=' + parts[1];
					lines[i - (group.length - x)] = variable;
				});
			} 
			group = [];
			longest = 0;
		}
	});
	return lines;
};

export default spaceify;