import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {

	const disposable = vscode.commands.registerCommand('myBeautify.spaceify', () => {
		const editor = vscode.window.activeTextEditor;
		if(!editor) { return; }

		const lines: string[]    = editor.document.getText().split('\n');
		const newContent: string = myBeautify(lines).join('\n');
		
		editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, lines.length, 0), newContent));
	});

	context.subscriptions.push(disposable);
};

const myBeautify = (content: string[]): string[] => {
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
