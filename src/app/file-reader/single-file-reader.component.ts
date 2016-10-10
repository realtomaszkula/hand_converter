import { Component, ElementRef, Renderer, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';

import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/retry'
import 'rxjs/add/operator/filter'

import { HandConverterService, HandConverter } from './hand-converter.service';

@Component({
    templateUrl: './single-file-reader.component.html',
    providers: [{ provide: HandConverter, useClass: HandConverterService  }]
})
export class SingleFileReaderComponent implements OnInit, OnDestroy {

    convertedHand: string = '';
    error: string = '';

    constructor(
        private renderer: Renderer, 
        private hcs: HandConverter,
        private cd: ChangeDetectorRef
    ) {}

    @ViewChild('paste') pasteArea: ElementRef;
    @ViewChild('result') resultArea: ElementRef;

    private pasteSubscription: Subscription;
    private keyupSubscription: Subscription;

    ngOnInit() {
        let pasteEl = this.pasteArea.nativeElement;
        let resultEl = this.resultArea.nativeElement;

        // streams
        const paste$ =  Observable.fromEvent(pasteEl, 'paste')
            .map((e: ClipboardEvent) => e.clipboardData.getData('text/plain'))

        const keyup$ = Observable.fromEvent(pasteEl, 'keyup')
            .map((e: KeyboardEvent) => e.target['value'])

        Observable.merge(keyup$, paste$)
            .filter(value => value)
            .debounceTime(100)
            .distinctUntilChanged()
            .subscribe(hand => {
                this.hcs.setHand(hand)
            })


        // subscriptions
        // paste$
        //     .subscribe(result => {
        //         // focus result area
        //         this.updateView(() => {
        //             this.renderer.invokeElementMethod(resultEl, 'focus')
        //         })

        //         // select entire output
        //         this.updateView(() => {
        //             this.renderer.invokeElementMethod(resultEl, 
        //                 'setSelectionRange', [0, resultEl.value.length])
        //         })
        //     })


        // service subscriptions
        this.hcs.convertHand$
            .subscribe((convertedHand: string) => {
            this.error = '';
            this.convertedHand = convertedHand;
            this.cd.detectChanges();
        })

        this.hcs.errors$.subscribe(error => {
            this.error = error;
            this.convertedHand = ''
            this.cd.detectChanges();
        })
    }


    ngOnDestroy() {
        this.keyupSubscription.unsubscribe();
        this.pasteSubscription.unsubscribe();
    }

    updateView(fn: Function) {
        setTimeout(fn, 0);
    }
}