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


    `,
    providers: [FileValidatorService]
})
export class FileReaderComponent implements OnInit {

    valid: Observable<number>;
    invalid: Observable<number>;

    constructor(private fileValidator: FileValidatorService) {
    }

    ngOnInit() {

    }

    onChange(files: File[]) {
        this.validateFiles(files);
    }

    private validateFiles(files: File[]) {
        this.fileValidator.validateNames(files);
    }

    private convertFiles(files: File[]) {

    }

}