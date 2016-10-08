import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/observable/fromEvent';

export interface ValidateResults {
   valid: number,
   invalid: number,
   total: number
}

@Injectable()
export class FileValidatorService {

    private progressSource = new Subject<number>();
    progress$ = this.progressSource.asObservable();

    setFiles(files: File[]) {

        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader();
            reader.onload = (e) => {
                let progress = Math.ceil(i * 100 / files.length);;
                this.progressSource.next(progress) 
            };
            reader.readAsText(files[i]);
        }
    }

    private validateName(file: File) {
        return (/\.txt$/).test(file.name);
    }
}

