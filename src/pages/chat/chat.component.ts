/**
 * Created by texpe on 13/01/2017.
 */

import { Component } from '@angular/core';
import { ChatProvider, Message } from "../../providers/chatProvider";
import { SettingsProvider } from "../../providers/settingsProvider";


@Component({
	selector   : 'page-chat',
	templateUrl: './chat.html',
	styleUrls  : [ './chat.scss' ]
})
export class ChatPage {
	private connected: boolean = false;
	private serviceStatus: any = [];
	private messages: Message[] = [];
	private data: any = {
		message: ''
	};
	private _settings: any = {};

	constructor(private chatProvider: ChatProvider, private settingsProvider: SettingsProvider) {
		this.messages = this.chatProvider.getMessages;
		this.connected = this.chatProvider.getConnected;
		this.serviceStatus = this.chatProvider.getServiceStatus;
		this._settings = this.settingsProvider.settings;

		this.chatProvider.Messages.subscribe(value => this.messages = value);
		this.chatProvider.Connected.subscribe(value => this.connected = value);
		this.chatProvider.ServiceStatus.subscribe(value => this.serviceStatus = value);
		this.settingsProvider.Settings.subscribe(value => this._settings = value);
	}

	toggleConnection() {
		if(!this.connected) this.chatProvider.join();
		else this.chatProvider.part();
	}

	sendMessage() {
		if(!this.data.message) return;

		this.chatProvider.send(this.data.message);
		this.data.message = '';
	}

	keyUp(e: KeyboardEvent) {
		if(e.keyCode === 13) {
			if(this.data.message.trim().length <= 0) return;
			e.preventDefault();
			this.sendMessage();
		}
	}
}