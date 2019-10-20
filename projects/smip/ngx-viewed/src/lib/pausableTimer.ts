import {BehaviorSubject, defer, interval, Observable, Subject} from 'rxjs';
import {filter, map, reduce, share, take, takeUntil, withLatestFrom} from 'rxjs/operators';

export function pausableTimer(pause: BehaviorSubject<boolean>, destroy: Subject<any>, timeToFinish: number, tickTime: number):
  { stepTimer: Observable<any>, completeTimer: Observable<any> } {
  const pausableTimer$ = defer(() => {
    let tickCounter = 0;
    const tickToFinish = Math.ceil(timeToFinish / tickTime) + 1;
    return interval(tickTime).pipe(
      withLatestFrom(pause),
      filter(([v, paused]) => !paused),
      take(tickToFinish),
      map(() => {
        tickCounter += tickTime;
        return tickCounter - tickTime;
      }),
    );
  }).pipe(share(), takeUntil(destroy));

  return {
    stepTimer: pausableTimer$,
    completeTimer: pausableTimer$.pipe(
      reduce((x, y) => y),
      filter(y => y >= timeToFinish),
    ),
  };
}
