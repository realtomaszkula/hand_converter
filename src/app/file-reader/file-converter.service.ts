import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromPromise';


@Injectable()
export class FileCoverterService {

  private progressSource = new Subject<string[]>();
  progress$ = this.progressSource.asObservable();


  private _result: string;
  get results() {
    return this._result;
  }

  extract(files: FileList) {
      let filesArr = Array.from(files);


  }






}
