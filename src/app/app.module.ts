import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from "@angular/router"

import { AppComponent } from './app.component';
import { FileReaderModule } from './file-reader/file-reader.module';
import { HandConverterRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent  ],
  imports: [
    HandConverterRoutingModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    FileReaderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
