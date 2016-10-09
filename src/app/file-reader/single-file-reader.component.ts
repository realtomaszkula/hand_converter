import { Component, ElementRef, Renderer, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/do'

import { HandConverterService } from './hand-converter.service';

@Component({
    templateUrl: './single-file-reader.component.html',
    providers: [HandConverterService]
})
export class SingleFileReaderComponent implements OnInit {

    convertedHand: string = '';

    constructor(private renderer: Renderer, private hcs: HandConverterService) {}

    @ViewChild('paste') pasteArea: ElementRef;
    @ViewChild('result') resultArea: ElementRef;

    ngOnInit() {
        let pasteEl = this.pasteArea.nativeElement;
        let resultEl = this.resultArea.nativeElement;

        // streams
        const paste$ =  Observable.fromEvent(pasteEl, 'paste')
            .map((e: ClipboardEvent) => e.clipboardData.getData('text/plain'))

        const keyup$ = Observable.fromEvent(pasteEl, 'keyup')
            .map((e: KeyboardEvent) => e.target['value'])

        // subscriptions
        paste$
            .subscribe(result => {
                // update binding
                this.convertedHand = this.convertHand(result)

                // focus result area
                this.updateView(() => {
                    this.renderer.invokeElementMethod(resultEl, 'focus')
                })

                // select entire output
                this.updateView(() => {
                    this.renderer.invokeElementMethod(resultEl, 
                        'setSelectionRange', [0, resultEl.value.length])
                })
            })

        keyup$
            .subscribe(result => this.convertedHand = this.convertHand(result))
    }

    updateView(fn: Function) {
        setTimeout(fn, 0);
    }

    convertHand(hand: string): string {
        this.hcs.setHand(hand);
        return this.hcs.convertedHand;
    }



    onClick() {
        this.renderer.invokeElementMethod(this.resultArea.nativeElement, 'focus');
    }




}