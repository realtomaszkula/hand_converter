import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

@Injectable()
export class FileCoverterService {
  
  convertedFiles$: Observable<string>
  private worker: Worker;

  constructor() {
      this.worker = new Worker('webworkers/name-worker.js');
      this.convertedFiles$ = Observable.create(obs => {
          this.worker.onmessage = function(e) {
            obs.next(e)
          }             
      })
      .map((e: MessageEvent) => e.data)
  }

  extract(files: FileList) {
      let filesArr = Array.from(files);
      
      for (let i = 0; i < filesArr.length; i++) {
            this.worker.postMessage(filesArr[i]);
      } 

  }






}
