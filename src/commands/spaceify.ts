import { removeMultipleSpaces } from "../helpers/replace";

const spaceify = (lines: string[]): string[] => {
	let longest: number = 0;
	let group: string[] = [];
	
	lines.forEach((line, i) => {
		if(line.match(/^( +|)(var|let|const)\b( +)[A-Za-z_$0-9]+( +=|=)/) && !line.match(/=>|=( +|)function\b/)) {

			line = removeMultipleSpaces(line.replace(/=/, ' = '));

			let length: number = line.split('=')[0].length;
			length > longest ? longest = length : null;

			group.push(line);
		} else {
			if(group.length > 1) {
				group.forEach((variable, x) => {
					if(variable.endsWith('=')) { return; };
					
					let parts: string[] = variable.split(/=(.+)/);
					let length: number  = parts[0].length;

					for(let i = 0; i < longest - length; i++) { parts[0] += ' '; }

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