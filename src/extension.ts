import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {

	context.subscriptions.push(

		vscode.commands.registerCommand('myBeautify.beautify', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const newContent: string = myBeautify(lines).join('\n');
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, lines.length, 0), newContent));
		}),

		vscode.commands.registerCommand('myBeautify.spaceify', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const newContent: string = spaceify(lines).join('\n');
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, lines.length, 0), newContent));
		}),
		
		vscode.commands.registerCommand('myBeautify.orderImports', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const imports: string[]  = orderImports(lines);
			const newContent: string = imports.join('\n') + '\n';
			
			if(imports.length < 2) { return; }
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, imports.length, 0), newContent));
		}),
	);
};

const myBeautify = (content: string[]): string[] => {
	spaceify(content);
	orderImports(content);
	return content;
};

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

export function deactivate() {}
