import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FileReaderComponent } from './file-reader/file-reader.component';

const routes: Routes = [
  {
    path: '',
    component: FileReaderComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class HandConverterRoutingModule { }
