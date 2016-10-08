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

    private validateLogSource = new BehaviorSubject<string[]>([]);
    validateLog$ = this.validateLogSource.asObservable();

    private validateFinishedSource = new BehaviorSubject<boolean>(false);
    validateFinished$ = this.validateFinishedSource.asObservable();

    private validateResultsSource = new BehaviorSubject<ValidateResults>({} as ValidateResults);
    validateResults$ = this.validateResultsSource.asObservable();

    private filteredFilesSource = new BehaviorSubject<File[]>([]);
    filteredFiles$ = this.filteredFilesSource.asObservable();

    setFiles(files: File[]) {
        this.validateNames(Array.from(files));
    }

    private validateNames(files: File[]): void {
        this.validateFinishedSource.next(false);

        let log: string[] = [];

        let result: ValidateResults = {
            total: files.length,
            valid: 0,
            invalid: 0
        }

        let filteredFiles = 
            files.filter((file: File) => {
                let isValid = this.validateName(file);

                if (isValid) {
                    result.valid++;
                } else {
                    result.invalid++;
                    log.push(`${file.name} - incorrect file extension.`);
                }

                return isValid;
            })

        this.filteredFilesSource.next(filteredFiles);
        this.validateLogSource.next(log);
        this.validateResultsSource.next(result)
        this.validateFinishedSource.next(true);

    }

    private validateName(file: File) {
        return (/\.txt$/).test(file.name);
    }
}