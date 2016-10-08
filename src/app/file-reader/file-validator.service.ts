import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


export interface ValidateResults {
   valid: number,
   invalid: number,
   total: number
}

@Injectable()
export class FileValidatorService {

    private validateLogSource = new Subject<string[]>();
    validateLog$ = this.validateLogSource.asObservable();

    private validateFinishedSource = new BehaviorSubject<boolean>(false);
    validateFinished$ = this.validateFinishedSource.asObservable();

    private validateResultsSource = new BehaviorSubject<ValidateResults>({} as ValidateResults);
    validateResults$ = this.validateResultsSource.asObservable();

    private files: File[];
    private filteredFiles: File[];

    setFiles(files: File[]) {
        this.files = Array.from(files);
        this.validateNames();
    }

    private validateNames(): void {
        this.validateFinishedSource.next(false);

        let log: string[] = [];
        let files = this.files;

        let result: ValidateResults = {
            total: this.files.length,
            valid: 0,
            invalid: 0
        }

        this.filteredFiles = 
            this.files.filter((file: File) => {
                let isValid = this.validateName(file);

                if (isValid) {
                    result.valid++;
                } else {
                    result.invalid++;
                    log.push(`${file.name} name is incorrect, accepting only txt files!`);
                }

                return isValid;
            })
            console.log(result);
        this.validateLogSource.next(log);
        this.validateResultsSource.next(result)
        this.validateFinishedSource.next(true);

    }

    private validateName(file: File) {
        return (/\.txt$/).test(file.name);
    }
}