/**
 * Created by texpe on 25/12/2016.
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

// Pages
import { AppComponent } from './app.component';
import { SettingsPage } from '../pages/settings/settings.component';
import { LoginPage } from '../pages/login/login.component';
import { RegisterPage } from '../pages/register/register.component';
import { ChatPage } from '../pages/chat/chat.component';

// Services
import { AuthProvider } from '../providers/authProvider';
import { ChatProvider } from '../providers/chatProvider';
import { SettingsProvider } from '../providers/settingsProvider';

// Pipes

const appRoutes: Routes = [
	{
		path     : 'login',
		component: LoginPage
	},
	{
		path     : 'home',
		component: SettingsPage
	},
	{
		path     : 'register',
		component: RegisterPage
	},
	{
		path     : 'chat',
		component: ChatPage
	},
	{
		path      : '**',
		redirectTo: '/login'
	}
];

@NgModule({
	declarations: [
		AppComponent,
		SettingsPage,
		LoginPage,
		RegisterPage,
		ChatPage
	],
	imports     : [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		RouterModule.forRoot(appRoutes, { useHash: true }),
	],
	providers   : [
		AuthProvider,
		ChatProvider,
		SettingsProvider
	],
	bootstrap   : [ AppComponent ]
})
export class AppModule {
}