/**
 * Created by texpe on 12/01/2017.
 */

import { Component, NgZone } from '@angular/core';
import { Http } from '@angular/http';
import { AuthProvider } from "../../providers/authProvider";
import { SettingsProvider } from "../../providers/settingsProvider";

/*declare var $: any;
 declare var electron: any;*/

@Component({
	selector   : 'page-settings',
	templateUrl: './settings.html',
	styleUrls  : [ './settings.scss' ]
})
export class SettingsPage {
	private user: any = {};
	private settings: any = {};

	constructor(private http: Http, private authProvider: AuthProvider, private settingsProvider: SettingsProvider, private _ngZone: NgZone) {
		this.user = this.authProvider.user;
		this.settings = this.settingsProvider.settings;

		this.authProvider.User.subscribe(value => this.user = value);
		this.settingsProvider.Settings.subscribe(value => {
			this._ngZone.run(() => this.settings = value);
			console.log(value);
		});
	}

	saveSettings() {
		this.settingsProvider.save(this.settings);
	}
}