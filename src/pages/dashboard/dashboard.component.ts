/**
 * Created by texpe on 23/01/2017.
 */

import { Component, NgZone, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { InfoProvider } from '../../providers/infoProvider';
import { Http } from "@angular/http";

declare var $: any;

@Component({
	selector   : 'page-dashboard',
	templateUrl: './dashboard.html',
	styleUrls  : [ './dashboard.scss' ]
})
export class DashboardPage implements AfterViewInit {
	@ViewChild('historyDropdown') historyDropdown: ElementRef;
	private info: any = {};
	private searchTimeout: any = null;
	private searchResults: Array<string> = [];
	private searching: boolean = false;
	private saving: boolean = false;

	constructor(private ngZone: NgZone, private infoProvider: InfoProvider, private http: Http) {
		this.infoProvider.Info.subscribe(value => {
			this.ngZone.run(() => this.info = value);
		});
	}

	ngAfterViewInit() {
		$(this.historyDropdown.nativeElement).dropdown();
	}

	save() {
		this.ngZone.run(() => this.saving = true);
		this.infoProvider.setInfo(this.info).then(() => {
			this.ngZone.run(() => this.saving = false);
		})
	}

	search() {
		if(this.searchTimeout) {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = null;
		}

		this.searchTimeout = setTimeout(() => {
			this.ngZone.run(() => this.searching = true);
			this.infoProvider.search(this.info.Category).then((results: any) => {
				this.ngZone.run(() => {
					this.searchResults = results;
					this.searching = false;
				});
			}).catch((err: any) => {
				this.ngZone.run(() => {
					this.searchResults = [];
					this.searching = false;
				});
			})
		}, 500);
	}

	selectCategory(index: number) {
		this.info.Category = this.searchResults[ index ];
		this.searchResults = [];
	}

	selectHistory(index: number) {
		const history = this.info.History[ index ];
		this.info.Title = history.Title;
		this.info.Category = history.Category;
	}

	limitLength(e: string, l: number) {
		if(!e) return '';
		return (e.length <= l ? e : e.substr(0, l));
	}

	optInStats() {
		alert("We're working on it... ^^");
	}
}