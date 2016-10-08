import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class FileValidatorService {

    private progressSource = new BehaviorSubject<number>(0);
    progress$ = this.progressSource.asObservable();

    setFiles(files: File[]) {
        const worker = new Worker('webworkers/name-worker.js');
        worker.onmessage = (m) => {
            this.progressSource.next(m.data);
        }
        worker.postMessage(files);
    }

}

