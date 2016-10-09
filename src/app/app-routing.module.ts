import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiFileReaderComponent } from './file-reader/multi-file-reader.component';
import { SingleFileReaderComponent } from './file-reader/single-file-reader.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'file',
    pathMatch: 'full'
  },
  {
    path: 'files',
    component: MultiFileReaderComponent
  },
  {
    path: 'file',
    component: SingleFileReaderComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class HandConverterRoutingModule { }
