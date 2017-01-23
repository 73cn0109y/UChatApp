/**
 * Created by texpe on 23/01/2017.
 */

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Subject } from "rxjs";
import { AuthProvider } from "./authProvider";

@Injectable()
export class InfoProvider {
	private _info: any = {};
	public Info: Subject<any> = new Subject<any>();

	constructor(private authProvider: AuthProvider, private http: Http) {
		this.getInfo();

		this.authProvider.User.subscribe(value => this.getInfo());
	}

	getInfo() {
		if(!this.authProvider.token) return;

		this.http.get(this.authProvider.api + '/dashboard?token=' + this.authProvider.token)
			.map((res: any) => res.json())
			.subscribe(response => {
				this._info = response.success ? response.info : {};
				this.Info.next(this._info);
			}, err => console.error(err));
	}

	setInfo(info: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.http.post(this.authProvider.api + '/dashboard?token=' + this.authProvider.token, info)
				.map((res: any) => res.json())
				.subscribe(response => {
					this._info = response.info;
					this.Info.next(this._info);
					resolve(null);
				}, err => {
					console.error(err);
					resolve(err);
				});
		});
	}

	search(query: string): any {
		return new Promise((resolve, reject) => {
			this.http.get(this.authProvider.api + '/dashboard/search?token=' + this.authProvider.token + '&q=' + query)
				.map((res: any) => res.json())
				.subscribe(response => response.success ? resolve(response.results) : reject(null),
					err => reject(null));
		});
	}

	get api(): string {
		return this.authProvider.api;
	}
}