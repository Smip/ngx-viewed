import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {pausableTimer} from './pausableTimer';

@Directive({
  selector: '[ngxViewedWatcher]',
})
export class WatcherDirective implements OnInit, OnDestroy, AfterViewInit {
  element: ElementRef;
  @Input() ngxViewedId: any;
  @Input() visiblePercent = 0.8;
  @Input() tickTime = 1000;
  @Input() timeToViewed = 3000;

  @Input() parentScroll: Element | null;

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
  private observer: IntersectionObserver;

  constructor(el: ElementRef) {
    this.element = el;
  }

  ngOnInit(): void {
    if (!('IntersectionObserver' in window)) {
      return;
    }
    if (this.visiblePercent > 1 || this.visiblePercent < 0) {
      console.error(`visiblePercent must be in range [0, 1]`);
      this.visiblePercent = 0.8;
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
    this.timer.stepTimer
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(x => {
      this.ngxViewedTick.emit({id: this.ngxViewedId, time: x});
    });
    this.timer.completeTimer
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
      this.ngxViewedViewed.emit({id: this.ngxViewedId});
      this.ngOnDestroy();
    });
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.observer.disconnect();
  }

  ngAfterViewInit(): void {
    if (!('IntersectionObserver' in window)) {
      return;
    }
    this.observer = new IntersectionObserver( entries => {
      let parentRect;
      if (this.parentScroll) {
        parentRect = this.parentScroll.getBoundingClientRect();
      } else {
        parentRect = entries[0].rootBounds;
      }
      if (
        entries[0].intersectionRatio >= this.visiblePercent
        ||
        (
          entries[0].boundingClientRect.height > parentRect.height
          && entries[0].intersectionRect.height / parentRect.height >= this.visiblePercent
        )
      ) {
        this.viewedAt = performance.now();
        this.isVisible = true;
        this.paused.next(false);
        this.ngxViewedShown.emit({id: this.ngxViewedId});
      } else {
        this.isVisible = false;
        this.visibleTime += performance.now() - this.viewedAt;
        this.paused.next(true);
        this.ngxViewedHidden.emit({id: this.ngxViewedId, time: Math.round(performance.now() - this.viewedAt)});
      }
    }, {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    });
    this.observer.observe(this.element.nativeElement as HTMLElement);
  }
}
