import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HandConverterService, HandConverter } from './hand-converter.service';

import { HandObject, Message, Response, HandConverterResponse} from '../../webworkers/interfaces';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/cache';
import 'rxjs/add/operator/scan';

interface PipelineFn {
    (handsArray: string[]): string[]
}


@Injectable()
export class FileCoverterService  {

  filesLoadedToMemory$: Observable<HandObject>
  filesConverted$: Observable<HandConverterResponse>;

  private fileReaderWorker: Worker;
  private handConverterWorker: Worker;

  private filesLengh: number = 0;

  constructor(private hcs: HandConverterService) {
        this.handConverterWorker = new Worker('../../webworkers/hand-converter.js');
        this.fileReaderWorker = new Worker('../../webworkers/file-reader.js');
        this.filesLoadedToMemory$ =  
            Observable
                .create(this.subscribeForFileReaderWorker)
                .share();
        
        this.filesConverted$ = 
            Observable
                .create(this.subscribeForHandCoverterWorker)
                .share();
  }

  subscribeForHandCoverterWorker = (observer) => {
      this.handConverterWorker.onmessage = function(e) {
          let response = e.data;
          observer.next(response);
          if (response.finished) {
              observer.complete();
          }
      }
  }

  subscribeForFileReaderWorker = (observer) =>{
    this.fileReaderWorker.onmessage = function(e) {
        let response: Response = e.data;
        observer.next(response);
        if (response.finished) observer.complete();
    }             
  }

  extract(files: FileList) {
      let filesArr = Array.from(files);
      this.filesLengh = filesArr.length;
      this.dispatchToFileReaderWorker(filesArr);

        this.filesLoadedToMemory$
        .subscribe(
          handObject => this.dispatchToHandConverterWorker(handObject),
          err => console.error(err), 
          
      )
  }

  private dispatchToFileReaderWorker(files: File[]) {
    for (let i = 0; i < files.length; i++) {
        this.fileReaderWorker.postMessage({
            file: files[i],
            isLast: files.length - 1 === i
        } as Message);
      } 
  }

  private dispatchToHandConverterWorker(handObject: HandObject) {
        this.handConverterWorker.postMessage(handObject)

        const seed: HandConverterResponse = { errors: [], convertedHands: []}
        this.filesConverted$
            .scan((acc, curr, index) => {
                 acc.convertedHands = [...acc.convertedHands, ...curr.convertedHands]
                 acc.errors = [...acc.errors, ...curr.errors]
                 return acc;
            },seed)
            .subscribe(x => console.log(x));
            

  }

}


