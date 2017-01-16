/**
 * Created by texpe on 13/01/2017.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Http } from '@angular/http';

declare var electron: any;
let ipc: any = electron.ipcRenderer;

@Injectable()
export class AuthProvider {
	protected _api: string = 'http://localhost:8080/api';
	private _token: string = null;
	private _user: any = {};
	public isLoggedIn: Subject<boolean> = new Subject<boolean>();
	public User: Subject<string> = new Subject<string>();

	constructor(private http: Http) {
		this.getToken();
	}

	login(data: any): Promise<boolean> {
		data.type = 'login';

		return new Promise((resolve, reject) => {
			this.http.post(this._api + '/login', data).map((res: any) => res.json()).subscribe((data: any) => {
				if(data.success) this.setToken(data.user.Token, true);
				resolve(data.success || false);
			}, err => {
				console.error(err);
				reject(false);
			});
		});
	}

	register(data: any): Promise<boolean> {
		data.type = 'register';

		return new Promise((resolve, reject) => {
			this.http.post(this._api + '/login', data).map((res: any) => res.json()).subscribe((data: any) => {
				if(data.success) this.setToken(data.user.Token, true);
				resolve(data.success || false);
			}, (err: any) => {
				console.error(err);
				reject(false);
			});
		});
	}

	private getToken() {
		ipc.once('get-token', (e: any, data: any) => {
			if(data && data.token) this.validateToken(data.token);
			else this.setToken(null);
		});
		ipc.send('get-token');
	}

	/**
	 * Makes sure the stored token is valid
	 * If it is, the response will contain the user object, otherwise null
	 * This will also register the user as "online" for the bot manager on the server
	 * @param e
	 */
	private validateToken(e: string) {
		this.http.post(this._api + '/token', { Token: e }).map((res: any) => res.json())
			.subscribe((data: any) => {
				if(data.success) this.setUser(data.user);
			}, err => console.error(err));
	}

	private setUser(user: any) {
		this._user = user;
		this.User.next(this._user);
		this.setToken(this._user.Token);
	}

	private setToken(e: string, ipcEmit: boolean = false) {
		if(ipcEmit) {
			ipc.once('set-token', (e: any, data: any) => this.setToken(data.token));
			ipc.send('set-token', { token: e });
			return;
		}
		this._token = e;
		this.isLoggedIn.next(this._token ? true : false);
	}

	get user(): any {
		return this._user;
	}

	get token(): string {
		return this._token;
	}

	get api(): string {
		return this._api;
	}
}