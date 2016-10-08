import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';

import { FileValidatorService, ValidateResults} from './file-validator.service';
import { HandConverterService } from './hand-converter.service';

@Component({
    selector: 'file-reader',
    template: `
    <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>

    <progress [value]="progress$ | async" max="100"></progress>

         
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

    progress$: Observable<number>;

    constructor(private fileValidator: FileValidatorService, private handConverter: HandConverterService) {
      this.progress$ = this.fileValidator.progress$;
    }

    ngOnInit() {

    }

    onChange(files: File[]) {
       this.fileValidator.setFiles(files)
    }
}
