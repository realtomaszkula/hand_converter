import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { FileValidatorService } from './file-validator.service';

@Component({
    selector: 'file-reader',
    template: `
    <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>

         <div *ngFor="let msg of validateLog | async">
            {{msg}}
         </div>


    `,
    providers: [FileValidatorService]
})
export class FileReaderComponent implements OnInit {

    validateLog: Observable<string[]>

    constructor(private fileValidator: FileValidatorService) {
        this.validateLog = this.fileValidator.validateLog$;
    }

    ngOnInit() {

    }

    onChange(files: File[]) {
        this.fileValidator.setFiles(files);
    }
}