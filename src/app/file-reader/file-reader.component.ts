import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import { FileValidatorService, ValidateResults} from './file-validator.service';

@Component({
    selector: 'file-reader',
    template: `
    <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>

         <div *ngIf="validateFinished | async">
            Uploaded:  
            <ul> 
                <li> Total: {{ (validateResults | async)?.total  }} </li>
                <li> Valid: {{ (validateResults | async)?.valid  }} </li>
                <li> Invalid: {{ (validateResults | async)?.invalid  }} </li>
            </ul> 
            Log:
            <ul class="log">
                <li *ngFor="let msg of validateLog | async">
                    {{msg}}
                </li>
            </ul>
        </div>



    `,
    styles: [ `
        .log { 
            background-color: #e6e6e6;
            height: 400px;
            overflow: scroll;
        }    
    `],
    providers: [FileValidatorService]
})
export class FileReaderComponent implements OnInit {

    validateLog: Observable<string[]>;
    validateResults: Observable<ValidateResults>;
    validateFinished: Observable<boolean>;

    constructor(private fileValidator: FileValidatorService) {
        this.validateLog = this.fileValidator.validateLog$;
        this.validateResults = this.fileValidator.validateResults$;
        this.validateFinished = this.fileValidator.validateFinished$;
    }

    ngOnInit() {

    }

    onChange(files: File[]) {
        this.fileValidator.setFiles(files);
    }
}