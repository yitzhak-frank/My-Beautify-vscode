import { CURLY_BRACKETS_CLOSE_G, CURLY_BRACKETS_OPEN_G, IMPORT_STATEMENT, ONE_SPACE_OR_MORE_G, TWO_SPACE_OR_MORE_G } from "../helpers/regex";

const orderImports = (content: string[]): { imports: string[], length: number} => {
	let imports: string[] = [];
	let length: number = 0;
	content.every((line, i) => {

		line = spaceifyImportBrackets(line);

		if(line.replace(ONE_SPACE_OR_MORE_G, '').length && !line.match(IMPORT_STATEMENT)) {

			if(imports.length > 1) {
				length = imports.length;
				orderImportsByLength(imports);
			}
			return false;
		}
		imports.push(line);
		return true;
	});

	// for beautify command
	content.splice(0, length);
	content.unshift(...removeEmptyLines(imports));

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
	imports = imports.filter(line => line.replace(ONE_SPACE_OR_MORE_G, '').length);
	if(imports.length) imports.push('');
	return imports;
};

const spaceifyImportBrackets = (line: string): string => line.replace(CURLY_BRACKETS_OPEN_G, ' { ').replace(CURLY_BRACKETS_CLOSE_G, ' } ').replace(TWO_SPACE_OR_MORE_G, ' ');

export default orderImports;