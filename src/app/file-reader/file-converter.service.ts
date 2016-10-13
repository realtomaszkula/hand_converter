import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { HandConverterService, HandConverter } from './hand-converter.service';

import { HandObject, Message, Response} from '../../webworkers/interfaces';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/cache';

interface PipelineFn {
    (handsArray: string[]): string[]
}


@Injectable()
export class FileCoverterService  {

  filesLoadedToMemory$: Observable<HandObject>
  filesConverted$: Observable<string>;

  private fileReaderWorker: Worker;
  private handConverterWorker: Worker;

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
      console.log('dispatching')
        this.handConverterWorker.postMessage(handObject)
  }

}


