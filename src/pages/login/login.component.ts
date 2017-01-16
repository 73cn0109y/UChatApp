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

	constructor(private formBuilder: FormBuilder, private authProvider: AuthProvider) {
		this.loginForm = this.formBuilder.group({
			email   : new FormControl('', [ <any>Validators.required ]),
			password: new FormControl('', [ <any>Validators.required ])
		});
	}

	login() {
		this.authProvider.login(this.loginData);
	}
}