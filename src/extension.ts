import spaceify from './spaceify';
import * as vscode from 'vscode';
import orderImports from './orderImports';

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

export const deactivate = () => {};
