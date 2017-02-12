/**
 * Created by texpe on 12/02/2017.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'unsafeHTML' })
export class UnsafeHTMLPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) {

	}

	transform(e: string): SafeHtml {
		return this.domSanitizer.bypassSecurityTrustHtml(e);
	}
}