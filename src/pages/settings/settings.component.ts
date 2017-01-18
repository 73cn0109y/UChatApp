/**
 * Created by texpe on 12/01/2017.
 */

import { Component, NgZone, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';
import { AuthProvider } from "../../providers/authProvider";
import { SettingsProvider } from "../../providers/settingsProvider";

declare var $: any;

@Component({
	selector   : 'page-settings',
	templateUrl: './settings.html',
	styleUrls  : [ './settings.scss' ]
})
export class SettingsPage implements AfterViewInit {
	private user: any = {};
	private settings: any = {};

	constructor(private http: Http, private authProvider: AuthProvider, private settingsProvider: SettingsProvider, private _ngZone: NgZone) {
		this.user = this.authProvider.user;
		this.settings = this.settingsProvider.settings;

		this.authProvider.User.subscribe(value => this.user = value);
		this.settingsProvider.Settings.subscribe(value => {
			this._ngZone.run(() => this.settings = value);
		});
	}

	ngAfterViewInit() {
		$('.dropdown-toggle').dropdown();
	}

	saveSettings() {
		this.settingsProvider.save(this.settings);
	}

	setColor(objName: string, property: string, e: Event) {
		let color = this.settings[ objName ].replace('rgba(', '').replace(')', '').split(',');
		let elem: any = e.target;

		switch(property) {
			case 'r':
				color[ 0 ] = elem.value;
				break;
			case 'g':
				color[ 1 ] = elem.value;
				break;
			case 'b':
				color[ 2 ] = elem.value;
				break;
			case 'a':
				color[ 3 ] = elem.value;
				break;
		}

		this.settings[ objName ] = 'rgba(' + color.join(',') + ')';
	}

	getColor(objName: string, property: string): string|number {
		if(!this.settings.hasOwnProperty(objName)) return '0';
		let color = this.settings[ objName ].substr(5, this.settings[ objName ].length - 6).split(',');
		switch(property) {
			case 'r':
				return this.clampNumber(color[ 0 ], 0, 255);
			case 'g':
				return this.clampNumber(color[ 1 ], 0, 255);
			case 'b':
				return this.clampNumber(color[ 2 ], 0, 255);
			case 'a':
				return this.clampNumber(color[ 3 ], 0, 1, true);
		}
		return '0';
	}

	clampNumber(e: string|number, min: number, max: number, isFloat: boolean = false): number {
		if(typeof e === 'string') e = isFloat ? parseFloat(e) : parseInt(e);
		return Math.max(min, Math.min(max, e));
	}
}