# react-draggable-list

This component lets you make a user re-orderable list that animates nicely:

[TODO put a gif here]

See example code in the `example` directory. The example may be compiled by
running:

```
npm install
npm run example-build
```

## DraggableList

This module exports the `DraggableList` React component, which takes the
following props:

* `list` must be an array of objects representing your list's items.
* `itemKey` must be the name of a property of the list's objects to use as a
 key to identify the objects, or it must be a function that takes an object as
 an argument and returns a key.
* `template` must be a React component used to render the list items. See the
 next section for a description of the props passed to the component.
* `onMoveEnd` may be a function which will be called when the user drags and
 drops an item to a new position in the list. The arguments to the function
 will be `(newList: Array<Object>, movedItem: Object, oldIndex: number,
 newIndex: number)`.
* `container`: If the DraggableList is inside a scrollable element, then this
 property should be set to a function which returns a reference to it. When the
 user moves an item in the list, the container will be scrolled to keep the
 item in view.
* `springConfig` is an optional object which sets the [SpringHelperConfig
 object passed to
 React-Motion](https://github.com/chenglou/react-motion/tree/85ca75c6de9ed85937d1c95646b6044a66981eee#--spring-val-number-config-springhelperconfig--opaqueconfig)
 for animations. This prop defaults to `{stiffness: 300, damping: 50}`.

## Template

The template component is passed the following props:

* `item` is an object from the list prop passed to DraggableList.
* `itemSelected` is a number from 0 to 1. It starts at 0, and quickly increases
 to 1 when the item is picked up by the user. This may be used to animate the
 item when the user picks it up or drops it.
* `anySelected` is a number from 0 to 1. It starts at 0, and quickly increases
 to 1 when any item is picked up by the user.
* `dragHandle` is a function which should be used during rendering to wrap the
 element to be used as the drag handle. The whole item will be draggable by the
 wrapped element.

The template component should be styled with max-height set to "100%" for best
results.

## Types

[Flow Type](http://flowtype.org/) declarations for this module are included! As
of Flow v0.22, you must add the following entries to your `.flowconfig` file's
options section for them to work:

```
[options]
esproposal.class_static_fields=enable
esproposal.class_instance_fields=enable
```
