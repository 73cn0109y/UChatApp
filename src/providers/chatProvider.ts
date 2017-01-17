/**
 * Created by texpe on 13/01/2017.
 */

import { Injectable, isDevMode } from '@angular/core';
import { Http } from "@angular/http";
import { Subject } from "rxjs";

import { AuthProvider } from "./authProvider";

/// <reference path="../../typings/globals/socket.io-client.index.d.ts" />
import * as io from 'socket.io-client';
declare var process: any;

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
	Message: string;
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
			this._messages.push(data);

			if(this._messages.length > 100)
				this._messages.splice(0, this._messages.length - 100);

			this.Messages.next(this._messages);
		});

		this._socket.on('service', (data: any) => {
			this._serviceStatus[ data.Service ] = data.Status;
			this.ServiceStatus.next(this._serviceStatus);
		});
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

	getNameForPlatform(platform: string): string {
		const user = this.authProvider.user;
		if(platform.toLowerCase() === 'broadcaster') return 'Broadcaster';
		if(!user.Services[ platform ] || !user.Services[ platform ].Connected) return null;
		const userInfo = user.Services[ platform ].UserServiceInfo;
		return userInfo.UserName;
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