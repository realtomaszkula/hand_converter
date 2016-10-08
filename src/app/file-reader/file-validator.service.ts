import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';


interface ValidateResults {
   valid: string,
   invalid: string
}

@Injectable()
export class FileValidatorService {

    private validateLogSource = new Subject<string[]>();
    validateLog$ = this.validateLogSource.asObservable();

    private validateResultsSource = new Subject<ValidateResults>();
    validateResults$ = this.validateLogSource.asObservable();

    private files: File[];
    private filteredFiles: File[];

    setFiles(files: File[]) {
        this.files = Array.from(files);
        this.validateNames();
    }

    private validateNames(): void {
        let log: string[] = [];
        this.filteredFiles = 
            this.files.filter((file: File) => {
                let isValid = this.validateName(file);
                if (!isValid) log.push(`${file.name} name is incorrect, accepting only txt files!`);
                return isValid;
            })

        this.validateLogSource.next(log);
        console.log(log)
    }

    private validateName(file: File) {
        return (/\.txt$/).test(file.name);
    }
}