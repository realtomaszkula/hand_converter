import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { FileValidatorService } from './file-validator.service';
import { HandConverterService } from './hand-converter.service';

@Component({
    selector: 'file-reader',
    template: `
    <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>

        <progress max="100" [value]="progressCounter"> </progress>

    `,
    styles: [ `
        .log { 
            background-color: #e6e6e6;
            height: 400px;
            overflow: scroll;
        }    
    `],
    providers: [FileValidatorService, HandConverterService ]
})
export class FileReaderComponent implements OnInit {

    progressCounter = 0;

    constructor(private fileValidator: FileValidatorService, private handConverter: HandConverterService, private cd: ChangeDetectorRef) {
    }

    ngOnInit() {
      this.fileValidator.progress$.subscribe(progress => {
          this.progressCounter = progress;
          this.cd.detectChanges();
      })
    }

    onChange(files: File[]) {
       this.fileValidator.setFiles(files)
    }
}
