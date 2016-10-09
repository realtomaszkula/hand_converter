import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { FileReaderComponent } from './file-reader.component';
import { DragAndDropComponent } from './drag-and-drop.component';
import { ProgressComponent } from './progress.component';



@NgModule({
    declarations: [ FileReaderComponent, DragAndDropComponent, ProgressComponent ],
    providers: [ ],
    imports: [ SharedModule ],
    exports: [ FileReaderComponent ]
})
export class FileReaderModule {}