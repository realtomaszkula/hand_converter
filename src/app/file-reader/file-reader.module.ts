import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { SingleFileReaderComponent } from './single-file-reader.component';
import { MultiFileReaderComponent } from './multi-file-reader.component';
import { DragAndDropComponent } from './drag-and-drop.component';
import { ProgressComponent } from './progress.component';
import { ButtonComponent } from './button.component';



@NgModule({
    declarations: [ MultiFileReaderComponent, DragAndDropComponent, ProgressComponent, SingleFileReaderComponent, ButtonComponent ],
    providers: [ ],
    imports: [ SharedModule ],
    exports: [ MultiFileReaderComponent ]
})
export class FileReaderModule {}