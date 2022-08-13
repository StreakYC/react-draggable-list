# react-draggable-list

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/StreakYC/react-draggable-list/blob/master/LICENSE.txt) [![npm version](https://badge.fury.io/js/react-draggable-list.svg)](https://badge.fury.io/js/react-draggable-list) [![Circle CI](https://circleci.com/gh/StreakYC/react-draggable-list.svg?style=shield)](https://circleci.com/gh/StreakYC/react-draggable-list)

This component lets you make a user re-orderable list that animates nicely so
that the user can easily move large items:

![Example](https://streakyc.github.io/react-draggable-list/video/dragitem.gif)

The above example can be tried here:

https://streakyc.github.io/react-draggable-list/example/

You can find its code in the `example` directory. The example may be compiled
by running:

```
yarn
yarn example-build
# or use this to auto-rebuild on changes:
yarn example-watch
```

## DraggableList

This module exports the `DraggableList` React component, which takes the
following props:

- `list` must be an array of objects representing your list's items.
- `itemKey` must be the name of a property of the list's objects to use as a
  key to identify the objects, or it must be a function that takes an object as
  an argument and returns a key.
- `template` must be a React component used to render the list items. This must
  not be a stateless-functional component. If possible, don't pass a new
  class instance on every render. See the next section for more information
  on the template including a description of the props passed to the component.
- `onMoveEnd` may be a function which will be called when the user drags and
  drops an item to a new position in the list. The arguments to the function
  will be `(newList: Array<Object>, movedItem: Object, oldIndex: number, newIndex: number)`. A component using DraggableList should immediately store
  the newList into its state and then pass the new list (or an equivalent list)
  as the `list` prop to DraggableList.
- `container`: If the DraggableList is inside a scrollable element, then this
  property should be set to a function which returns a reference to it. When the
  user moves an item in the list, the container will be scrolled to keep the
  item in view. If the DraggableList is in no scrollable elements besides the
  page itself, then a function returning a reference to `document.body` should
  be given.
- `springConfig` is an optional object which sets the [SpringHelperConfig
  object passed to
  React-Motion](https://github.com/chenglou/react-motion/tree/85ca75c6de9ed85937d1c95646b6044a66981eee#--spring-val-number-config-springhelperconfig--opaqueconfig)
  for animations. This prop defaults to `{stiffness: 300, damping: 50}`.
- `padding` is an optional number of pixels to leave between items. Defaults to 10.
- `unsetZIndex` is an optional property that defaults to false. If set to true,
  then the z-index of all of the list items will be set to "auto" when the list
  isn't animating. This may have a small performance cost when the list starts
  and stops animating. Use this if you need to avoid having the list item create
  a stacking context when it's not being animated.
- `constrainDrag` is an option property that defaults to false. If it is set to
  true, then the y-coordinate of a dragged item will be constrained vertically to
  the bounds of the list.
- `autoScrollMaxSpeed` is an optional number that allows the scroll speed when
  the user drags to the top or bottom of the list to be overridden.
- `autoScrollRegionSize` is an optional number that allows the height of the
  region that triggers auto-scrolling when dragged onto to be overridden.
- `commonProps` is an optional value that will be passed as the `commonProps`
  prop to every template component instance.
- `onDragStart` is an optional function which is called once a list item starts
  being dragged.
- `onDragEnd` is an optional function which is called once a list item is no longer being dragged. It differs from `onMoveEnd` in that it's called even if the user does not reorder any items in the lists, like when an item is just picked up and then dropped.

A DraggableList instance has the following methods:

- `getItemInstance(key)` will return a reference to the mounted instance of the
  template for a given key.

## Template

The template component is passed the following props:

- `item` is an object from the list prop passed to DraggableList.
- `itemSelected` is a number from 0 to 1. It starts at 0, and quickly increases
  to 1 when the item is picked up by the user. This may be used to animate the
  item when the user picks it up or drops it.
- `anySelected` is a number from 0 to 1. It starts at 0, and quickly increases
  to 1 when any item is picked up by the user.
- `dragHandleProps` is an object which should be spread as props on the HTML
  element to be used as the drag handle. The whole item will be draggable by the
  wrapped element. See the
  [example](https://github.com/StreakYC/react-draggable-list/blob/master/example/Example.js)
  to see how it should be used.
- `commonProps` will be set to the same value passed as the `commonProps` prop
  to the DraggableList component.

The template component should be styled with max-height set to "100%" for best
results.

The template component will have its props updated many times quickly during
the animation, so implementing `shouldComponentUpdate` in its children is
highly recommended.

The template component may have a `getDragHeight` method which may return a
number to set the height in pixels of the item while the user is dragging it.
If the method returns null or is not present, then the drag height will be
equal to the element's natural height.

## Bundling Note

To use this module in browsers, a CommonJS bundler such as Parcel, Browserify, or
Webpack should be used.

This project relies on the javascript Map object being available globally. A
global polyfill such as [Babel's polyfill](https://babeljs.io/docs/usage/polyfill/)
is required to support [older browsers that don't implement these](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Browser_compatibility).

## Types

Both [TypeScript](https://www.typescriptlang.org/) and
[Flow](https://flowtype.org/) type definitions for this module are included!
The type definitions won't require any configuration to use.
