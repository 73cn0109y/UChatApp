/**
 * Created by texpe on 12/01/2017.
 */

import { Component, ViewEncapsulation, NgZone, isDevMode } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthProvider } from "../providers/authProvider";

@Component({
	selector     : 'app',
	templateUrl  : './app.html',
	styleUrls    : [ './app.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class AppComponent {
	private isLoggedIn: boolean = false;

	constructor(private router: Router, private authProvider: AuthProvider, private zone: NgZone) {
		this.authProvider.isLoggedIn.subscribe(value => {
			this.router.navigate([ value ? '/dashboard' : '/login' ]);
			this.zone.run(() => this.isLoggedIn = value);
		});

		this.router.events.forEach(e => {
			if(e instanceof NavigationStart) {
				if(!this.authProvider.isLoggedIn && e.url !== '/login' && e.url !== '/register')
					this.router.navigate([ '/login' ]);
			}
		});
	}

	private openGameWindow() {
		const host = (isDevMode() ? 'http://localhost:8080/' : 'https://uchatapi-frosenos.rhcloud.com:8443/');
		window.open('./games.html?token=' + this.authProvider.token + '&host=' + host, 'UChat - Game',
			'width=400,height=300,minWidth=400,minHeight=300');
	}
}