const orderImports = (content: string[]): string[] => {
	let imports: string[] = [];
	content.every((line, i) => {
		if(!line.startsWith('import')) {
			if(imports.length > 1) {
				imports.sort((a: string, b: string) => {
					return (
						(a.split(a.includes(' from ') ? 'from' : " '")[0].length) - 
						(b.split(b.includes(' from ') ? 'from' : " '")[0].length)
					);
				});
				content.splice(i - imports.length, imports.length);
				content.unshift(...imports);
			}
			return false;
		}
		imports.push(line);
		return true;
	});
	return imports;
};

export default orderImports;