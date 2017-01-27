/**
 * Created by texpe on 28/01/2017.
 */

import { Component } from '@angular/core';
import { CommandsProvider } from "../../providers/commandsProvider";

@Component({
	selector   : 'page-commands',
	templateUrl: './commands.html',
	styleUrls  : [ './commands.scss' ]
})
export class CommandsPage {
	private commands: any = [];
	private newCommand: any = {};
	private saving: boolean = false;
	private editing: boolean = false;
	private error: string = '';
	private displayError: boolean = false;

	constructor(private commandsProvider: CommandsProvider) {
		this.commands = this.commandsProvider.commands;

		this.commandsProvider.Commands.subscribe(value => this.commands = value);
	}

	save() {
		this.saving = true;

		if(this.editing) {
			this.commandsProvider.updateCommand(this.newCommand)
				.then((result: any) => {
					if(result.success) this.clearCommand();
					this.editing = !result.success;
					this.saving = false;
					this.showError(result.errorMsg);
				}).catch(() => {
				this.saving = false;
			});
		} else {
			this.commandsProvider.saveCommand(this.newCommand)
				.then((result: any) => {
					if(result.success) this.clearCommand();
					this.saving = false;
					this.showError(result.errorMsg);
				}).catch(() => {
				this.saving = false;
			});
		}
	}

	clearCommand() {
		this.newCommand = {
			Input : '',
			Output: ''
		};
	}

	deleteCommand(i: number) {
		this.commandsProvider.deleteCommand(this.commands[ i ]._id);
	}

	editCommand(i: number, cancel: boolean = false) {
		if(cancel) {
			this.clearCommand();
			this.editing = false;
			this.displayError = false;
			this.error = '';
			return;
		}
		this.newCommand = {
			_id   : this.commands[ i ]._id,
			Input : this.commands[ i ].Input,
			Output: this.commands[ i ].Output
		};
		this.editing = true;
	}

	showError(msg: string) {
		if(!msg) return;

		this.error = msg;
		this.displayError = true;

		setTimeout(() => {
				this.displayError = false;
				setTimeout(() => this.error = '', 500);
			},
			5000);
	}
}