import * as React from 'react';
import DraggableList, {TemplateProps} from '..';

// This file isn't meant to be executed. It's just a test for the type definitions.

interface Item {
  a: number;
  b: string;
}

interface MyTempProps {
  item: Item;
  itemSelected: number;
  // purposefully omit anySelected here
  dragHandle: TemplateProps<any,any>['dragHandle'];
}
interface MyTempState {
  foo: number;
}
class MyTemp extends React.Component<MyTempProps, MyTempState> {
  render() {
    return this.props.dragHandle(<div />);
  }
}

const list: Array<Item> = [
  {a: 123, b: 'xyz'}
];
const x = (
  <DraggableList
    itemKey="foo"
    list={list}
    template={MyTemp}
  />
);
const renderedDL: DraggableList<Item, void, MyTemp> = null as any;
const renderedItem = renderedDL.getItemInstance('foo');
(renderedItem as MyTemp);
