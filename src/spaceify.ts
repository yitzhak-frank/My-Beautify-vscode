const spaceify = (content: string[]): string[] => {
	let longest: number = 0;
	let group: string[] = [];
	
	content.forEach((line, i) => {
		if((line.includes('let ') || line.includes('const ') || line.includes('var ')) && line.includes('=') && !line.includes('=>')) {
			let length: number = line.split('=')[0].length;
			(length > longest) ? longest = length : null;
			group.push(line);
		} else {
			if(group.length > 1) {
				group.forEach((variable, x) => {
					while(variable.split('=')[0].length < longest) {
						let parts: string[] = variable.split('=');
						variable = parts[0] + ' =' + parts[1];
					};
					content[i - (group.length - x)] = variable;
				});
			} 
			group = [];
			longest = 0;
		}
	});
	return content;
};

export default spaceify;