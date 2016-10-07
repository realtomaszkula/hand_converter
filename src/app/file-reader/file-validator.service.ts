import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class FileValidatorService {


    private validSource = new Subject<File[]>()
    private invalidSource = new Subject<File[]>()

    valid$ =  this.validSource.asObservable();
    invalid$ =  this.invalidSource.asObservable();


    setFiles(files: File[]) {
        let valid: File[] = [];
        let invalid: File[] = [];

        for (let file of files) {
            this.validate(file) ? 
                valid.push(file) : 
                invalid.push(file)
        }

        console.log(valid.length);

        this.validSource.next(valid);
        this.invalidSource.next(invalid);
    }

    private validate(file: File): boolean {
        return (/\.txt$/).test(file.name);
    }



}