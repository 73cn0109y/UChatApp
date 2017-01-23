/**
 * Created by texpe on 13/01/2017.
 */

import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ChatProvider, Message } from "../../providers/chatProvider";
import { SettingsProvider } from "../../providers/settingsProvider";

declare var $: any;

@Component({
	selector   : 'page-chat',
	templateUrl: './chat.html',
	styleUrls  : [ './chat.scss' ]
})
export class ChatPage implements AfterViewInit {
	@ViewChild('messageContainer') messageContainer: ElementRef;

	private connected: boolean = false;
	private serviceStatus: any = [];
	private messages: Message[] = [];
	private data: any = {
		message: ''
	};
	private _settings: any = {};
	private scrollLocked: boolean = false;

	constructor(private chatProvider: ChatProvider, private settingsProvider: SettingsProvider) {
		this.messages = this.chatProvider.getMessages;
		this.connected = this.chatProvider.getConnected;
		this.serviceStatus = this.chatProvider.getServiceStatus;
		this._settings = this.settingsProvider.settings;

		this.chatProvider.Messages.subscribe(value => {
			this.messages = value;
			this.scrollToBottom();
		});
		this.chatProvider.Connected.subscribe(value => this.connected = value);
		this.chatProvider.ServiceStatus.subscribe(value => this.serviceStatus = value);
		this.settingsProvider.Settings.subscribe(value => this._settings = value);
	}

	ngAfterViewInit() {
		$(this.messageContainer.nativeElement).on('mousewheel', function(e: any) {
			const $this = $(this);
			const scrollUp = e.originalEvent.deltaY < 0;
			const scrollHeight = this.scrollHeight - $this.height();

			if(scrollUp && $this.scrollTop() >= scrollHeight - 200) {
				$this.stop();
				this.scrollLocked = true;
			}
			else if(!scrollUp && $this.scrollTop() >= scrollHeight - 200)
				this.scrollLocked = false;
		});
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

	scrollToBottom() {
		const $messagesContainer = $(this.messageContainer.nativeElement);

		if(this.messages.length > 0 && !this.scrollLocked) {
			$messagesContainer.stop(true, true).animate({
				scrollTop: $messagesContainer[ 0 ].scrollHeight - ($messagesContainer.height() - 100)
			}, 500);
		}
	}
}