import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { FileReaderComponent } from './file-reader.component';


@NgModule({
    declarations: [ FileReaderComponent ],
    providers: [ ],
    imports: [ SharedModule ],
    exports: [ FileReaderComponent ]
})
export class FileReaderModule {}