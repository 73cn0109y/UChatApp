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
import { DashboardPage } from '../pages/dashboard/dashboard.component';
import { CommandsPage } from '../pages/commands/commands.component';

// Components

// Services
import { AuthProvider } from '../providers/authProvider';
import { ChatProvider } from '../providers/chatProvider';
import { SettingsProvider } from '../providers/settingsProvider';
import { InfoProvider } from '../providers/infoProvider';
import { CommandsProvider } from '../providers/commandsProvider';

// Pipes
import { UnsafeHTMLPipe } from '../pipes/unsafeHTML';

const appRoutes: Routes = [
	{
		path     : 'login',
		component: LoginPage
	},
	{
		path     : 'register',
		component: RegisterPage
	},
	{
		path     : 'dashboard',
		component: DashboardPage
	},
	{
		path     : 'commands',
		component: CommandsPage
	},
	{
		path     : 'settings',
		component: SettingsPage
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
		ChatPage,
		DashboardPage,
		CommandsPage,
		UnsafeHTMLPipe,
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
		SettingsProvider,
		InfoProvider,
		CommandsProvider
	],
	bootstrap   : [ AppComponent ]
})
export class AppModule {
}