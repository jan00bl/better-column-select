// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { TextDecoder } from 'util';
import * as vscode from 'vscode';

var editor: vscode.TextEditor;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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

function isInLine(pos : vscode.Position, oldLine: number) {
	return editor.document.lineAt(pos.line).range.end.character >= pos.character;
}

function isOutOfBounds(line: number) {
	return !(0 <= line && line < editor.document.lineCount);
}

function getTabDifference(pos1: number, pos2: number) {
	return (getNumberOfTabs(pos1) - getNumberOfTabs(pos2));
}

function getNumberOfTabs(line: number) {
	let textLine = editor.document.lineAt(line);
	return textLine.text.split(/\t|	/).length - 1;
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

	editor = vscode.window.activeTextEditor;

	let selections = vscode.window.activeTextEditor.selections;


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

			if(isOutOfBounds(mainSelect.anchor.line + increase * i) || isOutOfBounds(mainSelect.active.line + increase * i)) {
				break;
			}

			let tmpPos1 = new vscode.Position(mainSelect.anchor.line + increase * i, mainSelect.anchor.character + getTabDifference(mainSelect.anchor.line, mainSelect.anchor.line + increase * i) * ((editor.options.tabSize as number) - 1));
			let tmpPos2 = new vscode.Position(mainSelect.active.line + increase * i, mainSelect.active.character + getTabDifference(mainSelect.active.line, mainSelect.active.line + increase * i) * ((editor.options.tabSize as number) - 1));

			if(isInLine(tmpPos1, mainSelect.anchor.line) && isInLine(tmpPos2, mainSelect.active.line)) {
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
