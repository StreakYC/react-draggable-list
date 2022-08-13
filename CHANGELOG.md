## 4.1.0 (2022-08-12)

- Implemented `onDragStart` and `onDragEnd` props. ([@JayHales](https://github.com/JayHales) in [#52](https://github.com/StreakYC/react-draggable-list/pull/52))

## 4.0.4 (2021-09-22)

- Updated peerDependencies list to mark compatibility with React 17.

## 4.0.3 (2019-06-05)

- Updated to use immutability-helper 3.0.

## 4.0.2 (2019-04-05)

- Fixed issue where the DraggableList could have an incorrect height during drag depending on the styling of its parents.

## 4.0.0 (2018-11-28)

### Breaking Changes

- React v16.6+ is now required.
- The `dragHandle` function prop was removed. Now the Template component is instead given a prop `dragHandleProps` which is an object that must be spread as props on the HTML element to be used as the drag handle.

ReactDraggableList v3:

```js
<div>
  {this.props.dragHandle(<div>drag me</div>)}
  <div>content</div>
</div>
```

ReactDraggableList v4:

```js
<div>
  <div {...this.props.dragHandleProps}>drag me</div>
  <div>content</div>
</div>
```

### Improvements

- No longer uses any deprecated APIs (lifecycle methods and ReactDOM.findDOMNode).
- Fixed bug where the `oldIndex` parameter passed to `onMoveEnd` was incorrect if the `list` prop was updated while the user was dragging an item.

## 3.7.0 (2018-11-05)

- Added TypeScript type definitions.
- Changed Flow type definitions to use `$ReadOnlyArray` where applicable. Users may need to change the type annotations on the function they give to the `onMoveEnd` prop to keep Flow's type-check passing.

## 3.6.0 (2018-08-24)

- Added `constrainDrag` prop. [#30](https://github.com/StreakYC/react-draggable-list/pull/30)

## 3.5.3 (2018-05-15)

- Updated for compatibility with Flow v0.72.

## 3.5.2 (2018-04-13)

- Improved Flow type definitions to cover the proper return type of `getItemInstance`.

## 3.5.1 (2018-04-13)

- Fixed accidental usage of `event` global variable. This didn't cause any user-visible bugs to my knowledge.

## 3.5.0 (2018-04-13)

- Flow types for DraggableList now include a type parameter representing the list item's type, enabling fuller type-checking coverage.

## 3.4.1 (2017-10-02)

- Updated package.json to mark compatibility with React v16.
- Internal: tests now use React v16.

## 3.4.0 (2017-09-11)

- Updated for compatibility with Flow v0.54.1. This made it incompatible with older versions of Flow, so I'm making this update be a semver-minor change so users still on an older Flow version can pin to the previous minor version. Because of its frequent changes, I'm not considering incompatibilities with old Flow versions as semver-major breaking changes.

## 3.3.1 (2017-07-07)

- Updated for compatibility with Flow v0.49.1.

## 3.3.0 (2017-04-25)

- Stop using the newly deprecated `React.PropTypes` and now use the separate prop-types module.

## 3.2.1 (2017-03-24)

- Fixed issue where components didn't re-render when the value of the `commonProps` prop changed. [#20](https://github.com/StreakYC/react-draggable-list/pull/20)

## 3.2.0 (2017-03-06)

- Added `autoScrollMaxSpeed` and `autoScrollRegionSize` props to DraggableList. [#15](https://github.com/StreakYC/react-draggable-list/pull/15)
- Added `commonProps` prop to DraggableList. [#18](https://github.com/StreakYC/react-draggable-list/pull/18)

## 3.1.4 (2017-03-06)

- Updated for compatibility with Flow v0.41.

## 3.1.3 (2017-01-24)

- Updated for compatibility with Flow v0.38.

## 3.1.2 (2016-10-26)

- Fixed issue with the dragged item itself being removed during the post-drag animation.

## 3.1.1 (2016-10-25)

- Fixed handling of items being removed from list during the post-drag animation.

## 3.1.0 (2016-10-25)

- Added `getItemInstance` method.

## 3.0.4 (2016-09-26)

- Fixed Flow type-checking issue when used with newer version of react-motion.

## 3.0.3 (2016-09-13)

- Updated for compatibility with Flow v0.32.

## 3.0.2 (2016-08-05)

- Updated for compatibility with Flow v0.30.

## 3.0.1 (2016-06-27)

- Fixed handling of props being changed while the user is dragging an item.
- Fixed issue where DraggableList could prevent elements from having a natural layout applied after being dragged when the container prop was not used.

## 3.0.0 (2016-04-07)

### Breaking Changes

- React v15 is now required.

## 2.1.0 (2016-03-02)

- Added `unsetZIndex` prop.

## 2.0.0 (2016-02-29)

### Breaking Changes

- If the `getDragHeight` method isn't present on the template component, the drag height now defaults to the element's natural height instead of the arbitrary height of 30px.

## 1.0.6 (2016-02-29)

- Fixed the DraggableList element changing height when the last item is grabbed.

## 1.0.5 (2016-02-25)

- Re-use dragHandle prop value given to component to reduce amount of re-renders.

## 1.0.3 (2016-02-25)

- Fixed a scroll animation glitch when DraggableList was not in a scrollable container.

## 1.0.2 (2016-02-25)

- Fixed an accuracy issue with the scroll animation on drop.

## 1.0.1 (2016-02-25)

- Fixed animation glitch if you pick up an item while it's still animating.
- Efficiency improvements: minimize amount of re-renders needed during dragging.

## 1.0.0 (2016-02-24)

Initial stable release.
