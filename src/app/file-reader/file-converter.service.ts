import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HandConverterService, HandConverter } from './hand-converter.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';

interface Message {
    isLast: boolean;
    file: File;
}

interface PipelineFn {
    (handsArray: string[]): string[]
}

interface Response {
    finished: boolean;
    hand: string;
}

@Injectable()
export class FileCoverterService  {


  private handFileStrings: string[] = [];
  private result: string[] = [];

  convertedFiles$: Observable<string>
  private extractWorker: Worker;


  constructor(private hcs: HandConverterService) {
        this.extractWorker = new Worker('webworkers/name-worker.js');
        this.convertedFiles$ = Observable.create(obs => {
            this.extractWorker.onmessage = function(e) {
                let response: Response = e.data;
                obs.next(response.hand);
                if (response.finished) obs.complete();
          }             
      })
  }

  extract(files: FileList) {
      let filesArr = Array.from(files);
      this.dispatchToWorker(filesArr);

        this.convertedFiles$
        .subscribe(
          hand => this.handFileStrings.push(hand),
          err => console.error(err),
          () => this.convertAll()   
      )
  }

  private dispatchToWorker(files: File[]) {
    for (let i = 0; i < files.length; i++) {
        this.extractWorker.postMessage({
            file: files[i],
            isLast: files.length - 1 === i
        } as Message);
      } 
  }

  private convertAll() {
      console.log('started');
        console.time('aaa')
            this.result = this.handFileStrings.reduce((acc, curr) => {

                let hands = curr.split('\n\n').filter(line => line.match(/\s/));
                let convertedHands = hands.map(hand => this.hcs.getResult(hand))

                return [...acc, ...convertedHands];
            }, [])
        console.timeEnd('aaa');
      console.log(this.result.length);
  }

  private



}


