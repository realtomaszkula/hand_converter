import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from "@angular/router"

import { AngularFireModule } from 'angularfire2';

import { AppComponent } from './app.component';
import { FileReaderModule } from './file-reader/file-reader.module';
import { HandConverterRoutingModule } from './app-routing.module';

export const firebaseConfig = {
    apiKey: "AIzaSyCxYiW9ox8UEg9Meoyvih4Unv-iXtvFqZA",
    authDomain: "hand-converter.firebaseapp.com",
    databaseURL: "https://hand-converter.firebaseio.com",
    storageBucket: "hand-converter.appspot.com",
    messagingSenderId: "434354935041"
};

@NgModule({
  declarations: [
    AppComponent  ],
  imports: [
    AngularFireModule.initializeApp(firebaseConfig),
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

