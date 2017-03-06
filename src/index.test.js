/* @flow */
/* eslint-disable no-console, react/prop-types */

import delay from 'pdelay';
import React from 'react';
import ReactDOM, {findDOMNode as _findDOMNode} from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import DraggableList from '../src';
import DragHandle from '../src/DragHandle';

function findDOMNode(cmp) {
  const el = _findDOMNode(cmp);
  if (!(el instanceof HTMLElement)) throw new Error();
  return el;
}

class TestTemplate extends React.Component {
  render() {
    const {item, dragHandle} = this.props;
    return dragHandle(<div className="item">{item.name}</div>);
  }

  getName() {
    return this.props.item.name;
  }

  getDragHeight() {
    return 30;
  }

  shouldComponentUpdate(nextProps) {
    return this.props.item !== nextProps.item;
  }

  componentDidMount() {
    const el = findDOMNode(this);
    if (!el) throw new Error();
    (Object:any).defineProperty(el, 'offsetHeight', {
      get: () => 115
    });
  }
}

const springConfig = {stiffness: 1500, damping: 50};

test('drag works', async () => {
  const onMoveEnd = jest.fn();

  let _scrollTop = 0;
  const containerEl: Object = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    }
  };

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const commonProps = {a: 'foo'};
  const root: DraggableList = (TestUtils.renderIntoDocument(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
      container={()=>containerEl}
      commonProps={commonProps}
    />
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  expect(root.getItemInstance('grif').getName()).toBe('grif');
  expect(root.getItemInstance('grif').getDragHeight()).toBe(30);
  expect(root.getItemInstance('grif').props.commonProps).toBe(commonProps);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  expect(root.state.dragging).toBe(false);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});
  expect(root.state.dragging).toBe(true);

  root._handleMouseMove({pageY: 600});
  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'caboose'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

  await delay(30);

  root._handleMouseMove({pageY: 650});
  const reorderedList2 = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'caboose'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList2);

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  expect(onMoveEnd.mock.calls[0]).toEqual(
    [reorderedList2, {name: 'caboose'}, 0, 4]
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList2);

  expect(_scrollTop).toBe(0);
  await delay(30);
  expect(_scrollTop).toBeGreaterThan(20);
});

test('two drags work', async () => {
  const onMoveEnd = jest.fn();

  let _scrollTop = 0;
  const containerEl: Object = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    }
  };

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const root: DraggableList = (TestUtils.renderIntoDocument(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
      container={()=>containerEl}
    />
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  expect(root.state.dragging).toBe(false);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});
  expect(root.state.dragging).toBe(true);

  root._handleMouseMove({pageY: 600});
  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'caboose'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

  await delay(30);

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  expect(onMoveEnd.mock.calls[0]).toEqual(
    [reorderedList, {name: 'caboose'}, 0, 2]
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate)
      .map(e=>e.props.item),
    reorderedList
  );

  expect(root.state.dragging).toBe(false);
  renderedHandles[0]._onMouseDown({pageY: 600, preventDefault() {}});
  expect(root.state.dragging).toBe(true);

  root._handleMouseMove({pageY: 650});

  const reorderedList2 = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'caboose'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList2);

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(2);

  expect(onMoveEnd.mock.calls[1]).toEqual(
    [reorderedList2, {name: 'caboose'}, 2, 3]
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList2);

  expect(_scrollTop).toBe(0);
  await delay(30);
  expect(_scrollTop).toBeGreaterThan(20);
});

test('props reordered during drag works', () => {
  const onMoveEnd = jest.fn();

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const div = document.createElement('div');
  const root: DraggableList = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});

  const propReorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'caboose', extra: 1},
    {name: 'donut'}
  ];
  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={propReorderedList}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  );

  root._handleMouseMove({pageY: 650});
  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'caboose', extra: 1},
    {name: 'grif'},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  expect(onMoveEnd.mock.calls[0]).toEqual(
    [reorderedList, {name: 'caboose', extra: 1}, 0, 4]
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);
});

test('item removed during drag works', () => {
  const onMoveEnd = jest.fn();

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const div = document.createElement('div');
  const root: DraggableList = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});

  const propReorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif', extra: 2},
    {name: 'donut'}
  ];
  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={propReorderedList}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  );

  root._handleMouseMove({pageY: 650});
  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif', extra: 2},
    {name: 'donut'}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);
});

test('item removed before drag end works', async () => {
  const onMoveEnd = jest.fn();

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const div = document.createElement('div');
  const root: DraggableList = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});
  root._handleMouseMove({pageY: 650});
  await delay(100);

  const propReorderedList = [
    {name: 'caboose', extra: 3},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif', extra: 2}
  ];
  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={propReorderedList}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  );

  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'caboose', extra: 3},
    {name: 'grif', extra: 2}
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);
});

test('dragged item removed after drag during animation works', () => {
  const onMoveEnd = jest.fn();

  const list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const div = document.createElement('div');
  const root: DraggableList = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});
  root._handleMouseMove({pageY: 650});

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const listMinusOne = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={listMinusOne}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(listMinusOne);
});

test('list is shown with correct positions after being fully changed during animation', async () => {
  const onMoveEnd = jest.fn();

  const div = document.createElement('div');
  const root: DraggableList = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={[
        {name: 'caboose'},
        {name: 'tucker'},
        {name: 'church'},
        {name: 'simmons'},
        {name: 'sarge'},
        {name: 'grif'},
        {name: 'donut'}
      ]}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  ): any);

  const renderedHandles = TestUtils.scryRenderedComponentsWithType(root, DragHandle);
  renderedHandles[0]._onMouseDown({pageY: 500, preventDefault() {}});

  await delay(100);

  root._handleMouseUp();
  await delay(1);

  expect((findDOMNode(root.getItemInstance('caboose')).parentElement:any).style.position).toBe('absolute');

  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={[
        {name: 'lopez'},
        {name: "o'malley"}
      ]}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
    />,
    div
  );
  await delay(200);
  expect((findDOMNode(root.getItemInstance('lopez')).parentElement:any).style.position).toBe('relative');
});
