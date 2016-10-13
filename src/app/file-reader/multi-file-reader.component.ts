import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/publishReplay';

import { FileCoverterService } from './file-converter.service';
import { HandConverterService, HandConverter } from './hand-converter.service';

@Component({
    templateUrl: './multi-file-reader.component.html',
    providers: [
        FileCoverterService,
        { provide: HandConverter, useClass: HandConverterService }
    ]
})
export class MultiFileReaderComponent implements OnInit {

    @ViewChild('handsInput') inputRef: ElementRef;

    loadedToMemoryCounter = 0;
    convertedCounter = 0;
    uploadedHandsCount = 0;
    uploadFinished = false;

    constructor(
        private handConverter: HandConverter,
        private fileConverter: FileCoverterService,
        private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
        const input = this.inputRef.nativeElement;

        const input$ = Observable.fromEvent(input, 'change')
            .map((e: Event) => e.target['files'])
            .subscribe((filelist: FileList) => {
                this.uploadedHandsCount = filelist.length;
                this.fileConverter.extract(filelist)
            });


        this.fileConverter.filesLoadedToMemory$
            .count(x => true)
            .subscribe(
                (count) => {
                    this.loadedToMemoryCounter = count / this.uploadedHandsCount * 100
                    this.cd.detectChanges();
                },
                (error) => console.error(error),
                () => this.uploadFinished = true
            )

        // this.fileConverter.filesConverted$
        //     .subscribe(x => console.log(x)),
        //     (e) => console.error(e),
        //     () => console.log('done')

    }
}
