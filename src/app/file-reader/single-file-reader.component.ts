import { Component, ElementRef, Renderer, ViewChild, OnInit, OnDestroy, ChangeDetectorRef,
    animate, trigger, style, state, transition, keyframes } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subscription }   from 'rxjs/Subscription';

import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/merge'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/debounceTime'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/retry'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/delay'

import { HandConverterService, HandConverter } from './hand-converter.service';

@Component({
    templateUrl: './single-file-reader.component.html',
    providers: [{ provide: HandConverter, useClass: HandConverterService  }],
    animations: [
        trigger('converted', [
            transition('active <=> inactive', animate(300, keyframes([
                style({ backgroundColor: '*'  , offset: 0 }),
                style({ backgroundColor: '#add8e6', offset: 0.3 }),
                style({ backgroundColor: '*'  , offset: 1 })
            ])))
        ])
    ]
})
export class SingleFileReaderComponent implements OnInit, OnDestroy {
    state: 'active' | 'inactive' = 'inactive';

    convertedHand: string = null;
    error: string = null;
    message: string = null;

    constructor(
        private renderer: Renderer, 
        private hcs: HandConverter,
        private cd: ChangeDetectorRef
    ) {}

    @ViewChild('paste') pasteArea: ElementRef;
    @ViewChild('result') resultArea: ElementRef;

    private pasteSubscription: Subscription;
    private mergedSubscription: Subscription;

    ngOnInit() {
        let pasteEl = this.pasteArea.nativeElement;
        let resultEl = this.resultArea.nativeElement;

        // streams
        const paste$ =  Observable.fromEvent(pasteEl, 'paste')
            .map((e: ClipboardEvent) => e.clipboardData.getData('text/plain'))
            .share()

        const keyup$ = Observable.fromEvent(pasteEl, 'keyup')
            .map((e: KeyboardEvent) => e.target['value'])

        // component subscriptions
        this.mergedSubscription = 
            Observable.merge(keyup$, paste$)
                .distinctUntilChanged()
                .filter(value => {
                    if (!value) {
                        // if the value is empty disable result area, do not pass to subscrie
                        this.convertedHand = '';
                        this.cd.detectChanges();
                    }
                    return value
                })
                .subscribe(hand => {
                    this.hcs.setHand(hand)
                })

        this.pasteSubscription = 
            paste$.subscribe(result => {
                if (!this.error) {
                    // focus result area
                    this.updateView(() => {
                        this.renderer.invokeElementMethod(resultEl, 'focus')
                    })

                    // select entire output
                    this.updateView(() => {
                        this.renderer.invokeElementMethod(resultEl, 
                            'setSelectionRange', [0, resultEl.value.length])
                    })

                    // animate
                    this.fadeInAndOutAnimation();
                }       

            })

        // service subscriptions
        this.hcs.convertHand$.subscribe((convertedHand: string) => {
            this.error = null;
            this.convertedHand = convertedHand;
            this.cd.detectChanges();

        })

        this.hcs.errors$.subscribe(error => {
            this.error = error;
            this.convertedHand = null;
            this.cd.detectChanges();
        })
    }

    fadeInAndOutAnimation() {
        this.state = this.state === 'active' ? 'inactive' : 'active';
    }


    ngOnDestroy() {
        this.mergedSubscription.unsubscribe();
        this.pasteSubscription.unsubscribe();
    }

    updateView(fn: Function) {
        setTimeout(fn, 0);
    }
}