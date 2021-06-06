const orderImports = (content: string[]): { imports: string[], length: number} => {
	let imports: string[] = [];
	let length: number = 0;
	content.every((line, i) => {

		line = spaceifyImportBrackets(line);

		if(line.replace(/\s/g, '').length && (!line.startsWith('import') || (!line.includes("'") && !line.includes('"')))) {

			if(imports.length > 1) {
				length = imports.length;
				orderImportsByLength(imports);
			}
			return false;
		}
		imports.push(line);
		return true;
	});
	return {imports: removeEmptyLines(imports), length};
};

const orderImportsByLength = (imports: string[]): void => {
	imports.sort((a: string, b: string) => {
		return (
			(a.split(a.includes(' from ') ? 'from' : a.includes(' require') ? ' require' : "import")[0].length) - 
			(b.split(b.includes(' from ') ? 'from' : b.includes(' require') ? ' require' : "import")[0].length)
		);
	});
};

const removeEmptyLines = (imports: string[]): string[] => {
	imports = imports.filter(line => line.replace(/\s/g, '').length);
	imports.push('');
	return imports;
};

const spaceifyImportBrackets = (line: string): string => line.replace(/{/g, ' { ').replace(/}/g, ' } ').replace(/  +/g, ' ');

export default orderImports;