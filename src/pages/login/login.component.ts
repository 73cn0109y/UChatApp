/**
 * Created by texpe on 13/01/2017.
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthProvider } from "../../providers/authProvider";

@Component({
	selector   : 'page-login',
	templateUrl: './login.html',
	styleUrls  : [ './login.scss' ]
})
export class LoginPage {
	private loginData: any = {
		email   : '',
		password: ''
	};
	private loginForm: FormGroup;
	private loginError: string = null;
	private showError: boolean = false;

	constructor(private formBuilder: FormBuilder, private authProvider: AuthProvider) {
		this.loginForm = this.formBuilder.group({
			email   : new FormControl('', [ <any>Validators.required ]),
			password: new FormControl('', [ <any>Validators.required ])
		});
	}

	login() {
		this.authProvider.login(this.loginData).then(success => {
			if(!success) {
				this.loginError = "Invalid Username/Password!";
				this.showError = true;
				setTimeout(() => this.showError = false, 3000);
			}
		}).catch(err => console.error(err));
	}
}