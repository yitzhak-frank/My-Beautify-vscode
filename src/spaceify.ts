const spaceify = (content: string[]): string[] => {
	let longest: number = 0;
	let group: string[] = [];
	
	content.forEach((line, i) => {
		if(line.match(/(var|let|const)\b( +)[A-Za-z_$0-9]+( +=|=)(?!(>| +>))/g)) {

			line = removeMultipleSpaces(line);

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
					content[i - (group.length - x)] = variable;
				});
			} 
			group = [];
			longest = 0;
		}
	});
	return content;
};

const removeMultipleSpaces = (line: string): string => {
	let start = '', i = 1;
	while(line[i] === ' ') { start += line[i]; i++; };
	return start + line.replace(/=/, ' = ').replace(/  +/g, ' ');
};

export default spaceify;