// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "better-column-select" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('better-column-select.up', () => {
			onUp();
		}),

		vscode.commands.registerCommand('better-column-select.down', () => {
			onDown();
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function isInLine(pos : vscode.Position) {
	if(!vscode.window.activeTextEditor) {
		return;
	}

	let document = vscode.window.activeTextEditor.document;

	return document.lineAt(pos.line).range.end.character >= pos.character;
	
}

function isOutOfBounds(line: number, editor: vscode.TextEditor) {
	return !(0 <= line && line < editor.document.lineCount);
}

function onUp() {
	changeSelections((a,b) => a.active.line - b.active.line, -1);
}

function onDown() {
	changeSelections((a,b) => b.active.line - a.active.line, 1);
}

function changeSelections(sortFunction: (a: vscode.Selection, b: vscode.Selection) => number, increase: number) {
	if(!vscode.window.activeTextEditor) {
		return;
	}

	let selections = vscode.window.activeTextEditor.selections;
	let editor = vscode.window.activeTextEditor;


	let sortedSelections = selections.concat([]).sort(sortFunction);

	let mainSelect = sortedSelections[0];

	if(mainSelect) {

		if(mainSelect === editor.selection && selections.length !== 1) {
			vscode.window.activeTextEditor.selections = vscode.window.activeTextEditor.selections
				.filter(a =>  a !== sortedSelections[sortedSelections.length - 1]);
			return;
		}

		let pos1;
		let pos2;

		for (let i = 1; true ; i++) {

			if(isOutOfBounds(mainSelect.anchor.line + increase * i, editor) || isOutOfBounds(mainSelect.active.line + increase * i, editor)) {
				break;
			}

			let tmpPos1 = new vscode.Position(mainSelect.anchor.line + increase * i, mainSelect.anchor.character);
			let tmpPos2 = new vscode.Position(mainSelect.active.line + increase * i, mainSelect.active.character);

			if(isInLine(tmpPos1) && isInLine(tmpPos2)) {
				pos1 = tmpPos1;
				pos2 = tmpPos2;
				break;
			}
		}

		if(!pos1 || !pos2) {
			return;
		}

		let newSelect = new vscode.Selection(pos1, pos2);
		vscode.window.activeTextEditor.selections = vscode.window.activeTextEditor.selections.concat([newSelect]);
	}
}
