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

interface HandObject {
    hands: string,
    fileName: string
}

interface Response {
    finished: boolean;
    handObject: HandObject
}

interface ConvertAllResult {
    convertedHands: string[],
    errors: string[];
}

@Injectable()
export class FileCoverterService  {


  private handObjects: HandObject[] = []
  private result: ConvertAllResult

  convertedFiles$: Observable<HandObject>
  private extractWorker: Worker;


  constructor(private hcs: HandConverterService) {
        this.extractWorker = new Worker('webworkers/name-worker.js');
        this.convertedFiles$ = Observable.create(obs => {
            this.extractWorker.onmessage = function(e) {
                let response: Response = e.data;
                obs.next(response.handObject);
                if (response.finished) obs.complete();
          }             
      })
  }

  extract(files: FileList) {
      let filesArr = Array.from(files);
      this.dispatchToWorker(filesArr);

        this.convertedFiles$
        .subscribe(
          handObject => this.handObjects.push(handObject),
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
    this.result = this.handObjects.reduce((acc, curr) => {
        let fileName = curr.fileName;
        let fileHands = curr.hands.split('\n\n').filter(line => line.match(/\s/));

        let errors: string[] = [];
        let convertedHands: string[] = [];

        fileHands.forEach(hand => {
            let convertionResults = this.hcs.convertHand(hand);
            if (convertionResults.converted) {
                convertedHands.push(convertionResults.convertedHand)
            } else {
                errors.push(convertionResults.error)
            }
        })
        return {
            convertedHands: [...acc.convertedHands, ...convertedHands],
            errors: [...acc.errors, ...errors]
        } 
    }, { convertedHands: [], errors: [] } )

    console.log(this.result);
        
  }

  private constructErrorMsg(firstLine: string, fileName: string, error: string): string {
      return `FILE: ${firstLine} HAND: ${firstLine} could not be converted because: ERROR - ${error}`
  }



}


