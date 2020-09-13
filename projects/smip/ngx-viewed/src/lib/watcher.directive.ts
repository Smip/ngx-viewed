import {Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, from, fromEvent, merge, of, Subject} from 'rxjs';
import {auditTime, mergeMap, takeUntil} from 'rxjs/operators';
import {pausableTimer} from './pausableTimer';

@Directive({
  selector: '[ngxViewedWatcher]',
})
export class WatcherDirective implements OnInit, OnDestroy {
  element: ElementRef;
  @Input() ngxViewedId: any;
  @Input() visiblePercent = 0.8;
  @Input() auditTime = 500;
  @Input() tickTime = 1000;
  @Input() timeToViewed = 3000;
  @Output() ngxViewedViewed: EventEmitter<{ id: any }> = new EventEmitter();
  @Output() ngxViewedTick: EventEmitter<{ id: any, time: number }> = new EventEmitter();
  @Output() ngxViewedShown: EventEmitter<{ id: any }> = new EventEmitter();
  @Output() ngxViewedHidden: EventEmitter<{ id: any, time: number }> = new EventEmitter();
  isVisible = false;
  timer: any;
  paused: BehaviorSubject<boolean>;
  viewedAt: number;
  visibleTime = 0;
  unsubscribe$: Subject<void> = new Subject();

  constructor(el: ElementRef) {
    this.element = el;
  }

  ngOnInit(): void {
    if (this.visiblePercent > 1 || this.visiblePercent < 0) {
      console.error(`visiblePercent must be in range [0, 1]`);
      this.visiblePercent = 0.8;
    }
    if (this.auditTime < 0) {
      console.error(`auditTime must be more then 0`);
      this.auditTime = 500;
    }
    if (this.tickTime < 0) {
      console.error(`tickTime must be more then 0`);
      this.tickTime = 500;
    }
    if (this.timeToViewed < 0) {
      console.error(`timeToViewed must be more then 0`);
      this.timeToViewed = 3000;
    }
    this.paused = new BehaviorSubject<boolean>(true);
    this.timer = pausableTimer(this.paused, this.unsubscribe$, this.timeToViewed, this.tickTime);
    this.timer.stepTimer.subscribe(x => {
      this.ngxViewedTick.emit({id: this.ngxViewedId, time: x});
    });
    this.timer.completeTimer.subscribe(() => {
      this.ngxViewedViewed.emit({id: this.ngxViewedId});
      this.ngOnDestroy();
    });


    merge(
      from(['scroll', 'resize'])
        .pipe(mergeMap(eventName => fromEvent(window, eventName))),
      from(['hidden', 'visibilitychange', 'scroll', 'resize'])
        .pipe(mergeMap(eventName => fromEvent(document, eventName))),
      of(true),
    ).pipe(
      auditTime(this.auditTime),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      const rect = this.element.nativeElement.getBoundingClientRect();
      const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
      const inView = !document.hidden && (
        (
          rect.top + rect.height * this.visiblePercent <= windowHeight &&
          rect.top + rect.height - rect.height * this.visiblePercent >= 0
        )
        ||
        (
          rect.top + rect.height > windowHeight &&
          rect.top <= 0
        )
      );
      if (!this.isVisible && inView) {
        this.viewedAt = performance.now();
        this.isVisible = true;
        this.paused.next(false);
        this.ngxViewedShown.emit({id: this.ngxViewedId});
      } else if (this.isVisible && !inView) {
        this.isVisible = false;
        this.visibleTime += performance.now() - this.viewedAt;
        this.paused.next(true);
        this.ngxViewedHidden.emit({id: this.ngxViewedId, time: Math.round(performance.now() - this.viewedAt)});
      }
    });

  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
