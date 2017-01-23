/**
 * Created by texpe on 13/01/2017.
 */

import { Injectable, isDevMode } from '@angular/core';
import { Http } from "@angular/http";
import { Subject } from "rxjs";
import { bttv } from './bttv';

import { AuthProvider } from "./authProvider";

/// <reference path="../../typings/globals/socket.io-client.index.d.ts" />
import * as io from 'socket.io-client';
declare var process: any;
declare var twitchEmoji: any;
declare var $: any;

export interface UserInfo {
	Username: string;
	isModerator: boolean;
	isSubscriber: boolean;
	isBroadcaster: boolean;
}

export interface Message {
	Service: string;
	Channel: string;
	UserInfo: UserInfo;
	Message: {
		Raw: String,
		Formatted: String
	};
	Timstamp: string;
}

@Injectable()
export class ChatProvider {
	private _token: string = null;
	private _socket: any = null;
	private _messages: Message[] = [];
	private _connected: boolean = false;
	private _connecting: boolean = false;
	private _serviceStatus: any[] = [];
	public Messages: Subject<Message[]> = new Subject<Message[]>();
	public Connected: Subject<boolean> = new Subject<boolean>();
	public ServiceStatus: Subject<any[]> = new Subject<any[]>();

	constructor(private authProvider: AuthProvider, private http: Http) {
		this._token = this.authProvider.token;
		this.setupSocket();

		this.authProvider.isLoggedIn.subscribe(value => {
			this._token = this.authProvider.token;
			this.setupSocket();
		});
	}

	setupSocket() {
		if(!this._token) return;
		if(this._socket) this._socket.disconnect();

		const host = (isDevMode() ? 'http://localhost:8080' : 'https://uchatapi-frosenos.rhcloud.com:8443/') + '?token=' + this._token;
		this._socket = io.connect(host, {
			forceNew  : true,
			transports: [ 'websocket', 'polling' ]
		});

		this._socket.on('connect', () => {
			console.log('Socket.io Connected');
			this.join();
		});

		this._socket.on('join', (data: any) => {
			this._connected = data;
			this.Connected.next(this._connected);
			this._connecting = false;
		});

		this._socket.on('part', (data: any) => {
			this._connected = data;
			this.Connected.next(this._connected);
			this._connecting = false;
		});

		this._socket.on('message', (data: any) => {
			this.parseImage(data.Message).then(url => {
				data.Message = {
					Raw      : data.Message,
					Formatted: `<img src='${url}' class='img-fill' />`
				};

				this.addMessage(data);
			}).catch(err => {
				data.Message = {
					Raw      : data.Message,
					Formatted: this.parseEmotes(data.Message)
				};

				this.addMessage(data);
			});
		});

		this._socket.on('service', (data: any) => {
			this._serviceStatus[ data.Service ] = data.Status;
			this.ServiceStatus.next(this._serviceStatus);
		});
	}

	addMessage(data: any) {
		data.Timestamp = this.humanTimestamp();

		this._messages.push(data);

		if(this._messages.length > 100)
			this._messages.splice(0, this._messages.length - 100);

		this.Messages.next(this._messages);
	}

	humanTimestamp(): string {
		const now = new Date();
		let hour   = now.getHours(),
		    minute = now.getMinutes(),
		    isPM   = now.getHours() >= 12;
		if(hour > 12) hour -= 12;
		if(hour === 0) hour = 12;
		return (hour < 10 && hour >= 0 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + (isPM ? ' PM' : ' AM');
	}

	join(): boolean {
		if(!this._socket || this._connecting) return false;

		this._connecting = true;
		this._socket.emit('join');

		return true;
	}

	part(): boolean {
		if(!this._socket || this._connecting) return false;

		this._connecting = true;
		this._socket.emit('part');

		return true;
	}

	send(message: string): boolean {
		if(!this._token) return false;

		this._socket.emit('send', { Message: message });

		return true;
	}

	messageHasMention(msg: any): boolean {
		const name = this.getNameForPlatform(msg.Service);
		if(!name) return false;
		const reg = new RegExp('(?:^|\\W)(' + name + '+)(?!\\w)', 'gi')
		if(msg.Message.Raw.toLowerCase().match(reg)) return true;
		return false;
	}

	getNameForPlatform(platform: string): string {
		const user = this.authProvider.user;
		if(platform.toLowerCase() === 'broadcaster') return 'Broadcaster';
		if(!user.Services[ platform ] || !user.Services[ platform ].Connected) return null;
		const userInfo = user.Services[ platform ].UserServiceInfo;
		return userInfo.UserName;
	}

	parseEmotes(e: string): string {
		const emotes = bttv.getEmotes();
		let bttvUrl = emotes.urlTemplate;
		for(let emote in emotes.emotes) {
			let data = emotes.emotes[ emote ];
			if(e.indexOf(data.code) < 0) continue;
			const url = ('http:' + bttvUrl).replace('{{id}}', data.id).replace('{{image}}', '1x');
			let reg = new RegExp('\\b' + data.code + '\\b', 'g');
			e = e.replace(reg, `<img class='twitch-emoji twitch-emoji-small' src='${url}' alt='${data.code}' />`);
		}
		e = twitchEmoji.parse(e, {
			emojiSize: 'small'
		}).replace('https://', 'http://');
		return e;
	}

	parseImage(e: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const match = e.trim().match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi);
			if(match.length <= 0) return reject();
			let url = match[ 0 ];
			if(e.trim() != url) return reject();
			if(url.startsWith('https:')) url = 'http:' + url.substr(6, url.length - 6);
			let img = new Image();
			img.className = 'img-fluid';
			img.onerror = () => {
				reject();
			};
			img.onload = () => {
				resolve(url);
			};
			img.src = url;
		});
	}

	get getMessages(): Message[] {
		return this._messages;
	}

	get getConnected(): boolean {
		return this._connected;
	}

	get getServiceStatus(): any[] {
		return this._serviceStatus;
	}
}