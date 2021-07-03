import spaceify from './commands/spaceify';
import constify from './commands/constify';
import arrowShot from './commands/arrowShot/main';
import varsRename from './commands/varsRename';
import * as vscode from 'vscode';
import orderImports from './commands/orderImports';
import loneline from './commands/loneline';

export const activate = (context: vscode.ExtensionContext) => {

	context.subscriptions.push(

		vscode.commands.registerCommand('myBeautify.beautify', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const length: number     = lines.length;
			const newContent: string = beautify(lines).join('\n');
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, length, 0), newContent));
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

		vscode.commands.registerCommand('myBeautify.loneline', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const length: number     = lines.length;
			const newContent: string = loneline(lines).join('\n');
			
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

		vscode.commands.registerCommand('myBeautify.arrowShot', () => {
			const editor = vscode.window.activeTextEditor;
			if(!editor) { return; }

			const lines: string[]    = editor.document.getText().split('\n');
			const length: number     = lines.length;
			const newContent: string = arrowShot(lines).join('\n');
			
			editor.edit(editBuilder => editBuilder.replace(new vscode.Range(0, 0, length, 0), newContent));
		}),
	);
};

const beautify = (content: string[]): string[] => {
	orderImports(content);
	content = varsRename(content.join('\n')).split('\n');
	content = constify(content);
	content = spaceify(content);
	content = arrowShot(content);
	content = loneline(content);
	return content;
};

export const deactivate = () => {};
