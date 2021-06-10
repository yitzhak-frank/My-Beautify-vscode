import spaceify from './spaceify';
import * as vscode from 'vscode';
import orderImports from './orderImports';
import varsRename from './varsRename';
import constify from './constify';

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

			const lines: string[]     = editor.document.getText().split('\n');
			const { imports, length } = orderImports(lines);
			const newContent: string  = imports.join('\n') + '\n';
			
			if(imports.length < 2) { return; }
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, length, 0), newContent));
		}),

		vscode.commands.registerCommand('myBeautify.varsRename', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const content: string    = editor.document.getText();
			const newContent: string = varsRename(content);
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, content.split('\n').length, 0), newContent));
		}),

		vscode.commands.registerCommand('myBeautify.constify', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const newContent: string = constify(lines).join('\n');
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, lines.length, 0), newContent));
		}),
		
	);
};

const myBeautify = (content: string[]): string[] => {
	spaceify(content);
	orderImports(content);
	content = varsRename(content.join('\n')).split('\n');
	content = constify(content);
	return content;
};

export const deactivate = () => {};
