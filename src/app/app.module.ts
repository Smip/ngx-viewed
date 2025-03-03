import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {WatcherDirective} from '@smip/ngx-viewed';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WatcherDirective,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
