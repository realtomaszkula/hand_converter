import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

import { FileValidatorService } from './file-validator.service';
import { HandConverterService } from './hand-converter.service';

@Component({
        template: `
        <drag-and-drop></drag-and-drop>
        <progress-component [value]="progressCounter"></progress-component>
        <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>
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
export class MultiFileReaderComponent implements OnInit {

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
