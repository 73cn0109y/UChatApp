/**
 * Created by texpe on 28/01/2017.
 */

import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { Http } from "@angular/http";
import { AuthProvider } from "./authProvider";

@Injectable()
export class CommandsProvider {
	private _commands: any = [];
	public Commands: Subject<any> = new Subject<any>();

	constructor(private http: Http, private authProvider: AuthProvider) {
		this.getCommands();
	}

	get commands(): any {
		return this._commands;
	}

	getCommands() {
		this.http.get(this.authProvider.api + '/commands?token=' + this.authProvider.token)
			.map((res: any) => res.json())
			.subscribe(data => {
				this._commands = data.success ? data.commands : {};
				this.Commands.next(this._commands);
			}, err => console.error(err));
	}

	saveCommand(data: any) {
		return new Promise((resolve, reject) => {
			this.http.post(this.authProvider.api + '/commands?token=' + this.authProvider.token, data)
				.map((res: any) => res.json())
				.subscribe(data => {
					if(data.success) {
						this._commands.push(data.command);
						this.Commands.next(this._commands);
					}
					resolve(data);
				}, err => {
					console.error(err);
					reject(false);
				});
		});
	}

	updateCommand(data: any) {
		return new Promise((resolve, reject) => {
			this.http.put(this.authProvider.api + '/commands?token=' + this.authProvider.token, data)
				.map((res: any) => res.json())
				.subscribe(data => {
					if(data.success) {
						for(let i = 0; i < this._commands.length; i++) {
							if(this._commands[ i ]._id === data.command._id) {
								this._commands[ i ] = data.command;
								break;
							}
						}
						this.Commands.next(this._commands);
					}
					resolve(data);
				}, err => {
					console.log(err);
					reject(err);
				});
		});
	}

	deleteCommand(id: string) {
		return new Promise((resolve, reject) => {
			this.http.delete(this.authProvider.api + '/commands?token=' + this.authProvider.token + '&id=' + id)
				.map((res: any) => res.json())
				.subscribe(data => {
					if(data.success) {
						for(let i = 0; i < this._commands.length; i++) {
							if(this._commands[ i ]._id === id) {
								this._commands.splice(i, 1);
								break;
							}
						}
					}
					resolve(data.success);
				}, err => {
					console.error(err);
					reject(false);
				});
		});
	}
}