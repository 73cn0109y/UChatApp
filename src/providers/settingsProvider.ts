/**
 * Created by texpe on 16/01/2017.
 */

import { Injectable } from '@angular/core';
import { AuthProvider } from "./authProvider";
import { Http } from "@angular/http";
import { Subject } from "rxjs";

@Injectable()
export class SettingsProvider {
	private _settings: any = {};
	private _token: string = null;
	public Settings: Subject<any> = new Subject<any>();

	constructor(private http: Http, private authProvider: AuthProvider) {
		this._token = this.authProvider.token;

		this.authProvider.isLoggedIn.subscribe(value => {
			this._token = this.authProvider.token;
			this.updateSettings();
		});

		this.updateSettings();
	}

	updateSettings() {
		this.http.get(this.authProvider.api + '/settings?token=' + this.authProvider.token)
			.map((res: any) => res.json())
			.subscribe(data => {
				if(data.success) this._settings = data.settings;
				this.Settings.next(this._settings);
			}, err => console.error(err));
	}

	save(data: any) {
		this.http.put(this.authProvider.api + '/settings?token=' + this.authProvider.token, data)
			.map((res: any) => res.json())
			.subscribe(data => {
				if(data.success) this._settings = data.settings;
				this.Settings.next(this._settings);
			}, err => console.error(err));
	}

	get settings(): any {
		return this._settings;
	}
}