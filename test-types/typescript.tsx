import * as React from 'react';
import DraggableList from '../src';

// This file isn't meant to be executed. It's just a test for the type definitions.

interface Item {
  a: number;
  b: string;
}

interface MyTempProps {
  item: Item;
  itemSelected: number;
  // purposefully omit anySelected here
  dragHandleProps: object;
}
interface MyTempState {
  foo: number;
}
class MyTemp extends React.Component<MyTempProps, MyTempState> {
  render() {
    return <div {...this.props.dragHandleProps} />;
  }
}

const list: Array<Item> = [
  {a: 123, b: 'xyz'}
];
const x = (
  <DraggableList<Item, void, MyTemp>
    itemKey="foo"
    list={list}
    template={MyTemp}
    onMoveEnd={ignoredNewList => {
      // ignore
    }}
  />
);
x;
const renderedDL: DraggableList<Item, void, MyTemp> = null as any;
const renderedItem = renderedDL.getItemInstance('foo');
(renderedItem as MyTemp);
