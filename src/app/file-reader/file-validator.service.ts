import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class FileValidatorService {

    validateNames(files: File[]) {
        const worker = new Worker('webworkers/name-worker.js');
        worker.postMessage(files)
        worker.addEventListener('message', e => console.log(e.data));
    }


}