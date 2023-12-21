import * as React from 'react';
import { DragHandleProps, DraggableList } from '../src';

// This file isn't meant to be executed. It's just a test for the type definitions.

interface Item {
  a: number;
  b: string;
}

interface MyTempProps {
  item: Item;
  itemSelected: number;
  // purposefully omit anySelected here
  dragHandleProps: DragHandleProps;
}
interface MyTempState {
  foo: number;
}
class MyTemp extends React.Component<MyTempProps, MyTempState> {
  render() {
    return <div {...this.props.dragHandleProps} />;
  }
}

const list: Array<Item> = [{ a: 123, b: 'xyz' }];
const x = (
  <DraggableList<Item, MyTemp>
    itemKey="foo"
    list={list}
    renderTemplate={({ item, itemSelected, dragHandleProps }) => (
      <MyTemp {...{ item, itemSelected, dragHandleProps }} />
    )}
    onMoveEnd={(ignoredNewList) => {
      // ignore
    }}
  />
);
x;
const renderedDL: DraggableList<Item, MyTemp> = null as any;
const renderedItem = renderedDL.getItemInstance('foo');
renderedItem as MyTemp;
