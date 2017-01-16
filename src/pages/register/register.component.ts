/**
 * Created by texpe on 13/01/2017.
 */

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthProvider } from '../../providers/authProvider';

@Component({
	selector   : 'page-register',
	templateUrl: './register.html',
	styleUrls  : [ './register.scss' ]
})
export class RegisterPage {
	private data: any = {
		name            : '',
		email           : '',
		password        : '',
		confirm_password: ''
	};
	private registerForm: FormGroup;

	constructor(private authProivder: AuthProvider, private formBuilder: FormBuilder) {
		this.registerForm = this.formBuilder.group({
			name            : new FormControl('', [ <any>Validators.required ]),
			email           : new FormControl('', [ <any>Validators.required ]),
			password        : new FormControl('', [ <any>Validators.required ]),
			confirm_password: new FormControl('', [ <any>Validators.required ])
		});
	}

	register() {
		this.authProivder.register(this.data).then(success => console.log("Register: " + success));
	}
}