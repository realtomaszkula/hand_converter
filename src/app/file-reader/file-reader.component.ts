import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/of';

import { FileValidatorService } from './file-validator.service';

@Component({
    selector: 'file-reader',
    template: `
    <input id="files" type="file" multiple 
         #input (change)="onChange(input.files)"/>
    <h4> Valid: {{ (invalid | async)?.length }} </h4>
    <h4> Invalid: {{ (valid | async)?.length }} </h4>

    `,
    providers: [FileValidatorService]
})
export class FileReaderComponent implements OnInit {

    valid: Observable<File[]>;
    invalid: Observable<File[]>;

    constructor(private fileValidator: FileValidatorService) {
    }

    ngOnInit() {
        this.invalid = this.fileValidator.invalid$
        this.valid = this.fileValidator.valid$;
    }

    onChange(files: File[]) {
        this.validateFiles(files);
        this.convertFiles(files);
    }

    private validateFiles(files: File[]) {
        this.fileValidator.setFiles(files);
    }

    private convertFiles(files: File[]) {

    }

}