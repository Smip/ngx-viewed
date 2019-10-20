import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
} from '@angular/core';
import {ContainerWatcherDirective} from './container-watcher.directive';
import {BehaviorSubject, from, fromEvent, merge, of, Subject} from 'rxjs';
import {auditTime, filter, flatMap, takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[ngxViewedContainer]',
})
export class ContainerDirective implements OnInit, OnDestroy, AfterContentInit {

  @ContentChildren(ContainerWatcherDirective, {descendants: true})
  childrenElements!: QueryList<ContainerWatcherDirective>;
  @Input() visiblePercent = 0.8;
  @Input() auditTime = 500;
  @Output() ngxViewedContainerShown: EventEmitter<true> = new EventEmitter();
  @Output() ngxViewedContainerHidden: EventEmitter<true> = new EventEmitter();

  element: ElementRef;
  isVisible = false;
  containerIsVisible: BehaviorSubject<boolean>;
  unsubscribe$: Subject<void> = new Subject();

  constructor(el: ElementRef) {
    this.element = el;
  }

  subscribeToChild(child) {
    child.timer.stepTimer.subscribe(x => {
      child.ngxViewedTick.emit({id: child.ngxViewedId, time: x});
    });
    child.timer.completeTimer.subscribe(() => {
      child.ngxViewedViewed.emit({id: child.ngxViewedId});
      child.ngOnDestroy();
    });
    child.isObservable = true;
  }

  ngAfterContentInit(): void {
    this.childrenElements.changes.pipe(filter(child => child && !child.isObservable)).subscribe(newChildren => {
      newChildren.forEach(child => this.subscribeToChild(child));
    });
    this.childrenElements.forEach(child => this.subscribeToChild(child));
    if (this.visiblePercent > 1 || this.visiblePercent < 0) {
      console.error(`visiblePercent must be in range [0, 1]`);
      this.visiblePercent = 0.8;
    }
    if (this.auditTime < 0) {
      console.error(`auditTime must be more then 0`);
      this.auditTime = 500;
    }
    this.containerIsVisible = new BehaviorSubject<boolean>(false);
    merge(
      from(['scroll', 'resize'])
        .pipe(flatMap(eventName => fromEvent(window, eventName))),
      from(['hidden', 'visibilitychange', 'scroll', 'resize'])
        .pipe(flatMap(eventName => fromEvent(document, eventName))),
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
        this.isVisible = true;
        this.ngxViewedContainerShown.emit(true);
        this.containerIsVisible.next(true);
      } else if (this.isVisible && !inView) {
        this.isVisible = false;
        this.ngxViewedContainerHidden.emit(true);
        this.containerIsVisible.next(false);
      }
    });

    merge(
      fromEvent(this.element.nativeElement, 'resize'),
      fromEvent(this.element.nativeElement, 'scroll'),
      this.containerIsVisible,
    ).pipe(
      auditTime(this.auditTime),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {

      const rect = this.element.nativeElement.getBoundingClientRect();
      this.childrenElements.forEach(childElement => {
        const childRect = childElement.element.nativeElement.getBoundingClientRect();
        const inView = (
          (
            childRect.top - rect.top + childRect.height - childRect.height * childElement.visiblePercent >= 0 &&
            childRect.top - rect.top + childRect.height * childElement.visiblePercent <= rect.height
          )
          ||
          (
            childRect.top - rect.top + childRect.height > rect.height &&
            childRect.top - rect.top <= 0
          )
        );
        if (!childElement.isVisible && inView && this.isVisible) {
          childElement.viewedAt = performance.now();
          childElement.isVisible = true;
          childElement.paused.next(false);
          childElement.ngxViewedShown.emit({id: childElement.ngxViewedId});
        } else if (childElement.isVisible && (!inView || !this.isVisible)) {
          childElement.isVisible = false;
          childElement.paused.next(true);
          childElement.ngxViewedHidden.emit({id: childElement.ngxViewedId, time: Math.round(performance.now() - childElement.viewedAt)});
        }
      });

    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
  }


}
