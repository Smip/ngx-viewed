import {NgModule} from '@angular/core';
import {WatcherDirective} from './watcher.directive';
import {ContainerDirective} from './container.directive';
import {ContainerWatcherDirective} from './container-watcher.directive';


@NgModule({
  declarations: [WatcherDirective, ContainerDirective, ContainerWatcherDirective],
  imports: [],
  exports: [WatcherDirective, ContainerDirective, ContainerWatcherDirective],
})
export class NgxViewedModule {
}
