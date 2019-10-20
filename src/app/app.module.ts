import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgxViewedModule} from '@smip/ngx-viewed';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxViewedModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
