# NgxViewed

Angular library for fixing the fact of viewing posts, comments, images, etc.

The library uses [IntersectionObserver](https://developer.mozilla.org/docs/Web/API/Intersection_Observer_API)

## [Demo](https://smip.github.io/ngx-viewed/dist/ngx-viewed)

## Installation

Run `npm install @smip/ngx-viewed -S`

Add `NgxViewedModule` import to your module:

```typescript
import { NgxViewedModule } from '@smip/ngx-viewed';

...

@NgModule({
  imports: [
    ...
    NgxViewedModule
    ...
  ],
  ...
})
```

## Usage

Add `ngxViewedWatcher` directive to element witch will be observable.

Directive ngxViewedWatcher provide next input parameters:

- **ngxViewedId**: _any_ - variable to help you handle outputs. Will be included in every callback. 
- **visiblePercent**: _number_ - value from 0 to 1. How element should be visible on the screen to start timer. Default: **0.8** (80%)
- **timeToViewed**: _number_ - value from 0 in ms. Time when library will emit output event. After this time library finish observe element. Default: **3000**
- ~~**auditTime**: _number_ - value from 0 in ms. To optimize the work, the library checks the visibility of the element no more than once every **x** ms. Default: **500**~~ **[deprecated]**
- **tickTime**: _number_ - value from 0 in ms. Value must be less of _timeToViewed_. How often will be emitted _ngxViewedTick_. Default: **1000**;
- **parentScroll**: _Element_ - a parent element with scroll (see demo);

Outputs:

- **ngxViewedViewed**: { id: any } - will be emitted once for every element after _timeToViewed_ ms. You can use it to fix fact of viewing. 
- **ngxViewedTick**: { id: any, time: number } - will be emitted every _tickTime_ ms.
- **ngxViewedShown**: { id: any } - will be emitted when element is shown.
- **ngxViewedHidden**: { id: any, time: number } - will be emitted when element is hidden.

### Example

```html
<div
    ngxViewedWatcher
    [ngxViewedId]="'post1'"
    [timeToViewed]="3000"
    [visiblePercent]="0.8"
    (ngxViewedTick)="onTick($event)"
    (ngxViewedShown)="onShown($event)"
    (ngxViewedHidden)="onHidden($event)"
    (ngxViewedViewed)="onViewed($event)"
  >
```

### Deprecated in version 3.0
~~When your observable elements in some block with scroll you should use `ngxViewedContainer` directive for parent element (with scroll) and `ngxViewedContainerWatcher` for observable elements.~~

~~ngxViewedContainer directive has next inputs:~~

~~- **visiblePercent**: _number_ - value from 0 to 1. How container should be visible on the screen to start observe child elements. Default: **0.8** (80%)~~
~~- **auditTime**: _number_ - value from 0 in ms. To optimize the work, the library checks the visibility of the container no more than once every **x** ms. Default: **500**~~

~~And outputs:~~

~~- **ngxViewedContainerShown**: _true_ - will be emitted when container is shown.~~
~~- **ngxViewedContainerHidden**: _true_ - will be emitted when container is hidden.~~

~~ngxViewedContainerWatcher directive has same inputs and outputs as ngxViewedWatcher~~

## Issues
If you have questions or issues feel free to create new an topic in [issues](https://github.com/Smip/ngx-viewed/issues).

## License

Licensed under [MIT](https://opensource.org/licenses/MIT).
