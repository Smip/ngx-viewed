import {Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {pausableTimer} from './pausableTimer';

@Directive({
  selector: '[ngxViewedContainerWatcher]',
})
export class ContainerWatcherDirective implements OnInit, OnDestroy {

  element: ElementRef;
  @Input() ngxViewedId: any;
  @Input() visiblePercent = 0.8;
  @Input() tickTime = 1000;
  @Input() timeToViewed = 3000;
  @Output() ngxViewedViewed: EventEmitter<{ id: any }> = new EventEmitter();
  @Output() ngxViewedTick: EventEmitter<{ id: any, time: number }> = new EventEmitter();
  @Output() ngxViewedShown: EventEmitter<{ id: any }> = new EventEmitter();
  @Output() ngxViewedHidden: EventEmitter<{ id: any, time: number }> = new EventEmitter();
  isVisible = false;
  unsubscribe$: Subject<void> = new Subject();
  timer: any;
  paused: BehaviorSubject<boolean>;
  isObservable = false;
  viewedAt: number;

  constructor(el: ElementRef) {
    this.element = el;
  }

  ngOnInit(): void {
    this.paused = new BehaviorSubject<boolean>(true);
    this.timer = pausableTimer(this.paused, this.unsubscribe$, this.timeToViewed, this.tickTime);
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
