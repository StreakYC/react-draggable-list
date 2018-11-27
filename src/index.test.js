/* @flow */

import delay from 'pdelay';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import DraggableList from '../src';

class TestTemplate extends React.Component<Object> {
  _elRef = React.createRef();

  render() {
    const {item, dragHandleProps} = this.props;
    return <div ref={this._elRef} className="item" {...dragHandleProps}>{item.name}</div>;
  }

  getName() {
    return this.props.item.name;
  }

  getDragHeight() {
    return 30;
  }

  getDOMNode(): HTMLElement {
    if (!this._elRef.current) throw new Error();
    return this._elRef.current;
  }

  shouldComponentUpdate(nextProps) {
    return this.props.item !== nextProps.item;
  }

  componentDidMount() {
    const el = this._elRef.current;
    if (!el) throw new Error();
    (Object:any).defineProperty(el, 'offsetHeight', {
      get: () => 115
    });
  }
}

const springConfig = {stiffness: 1500, damping: 50};

// TODO remove .only
test.only('drag works', async () => {
  let _scrollTop = 0;
  const containerEl: Object = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    }
  };

  let list = [
    {name: 'caboose'},
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'grif'},
    {name: 'donut'}
  ];
  const commonProps = {a: 'foo'};

  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  function render(): DraggableList<*> {
    return (ReactDOM.render(
      <DraggableList
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
        container={()=>containerEl}
        commonProps={commonProps}
      />,
      div
    ): any);
  }

  const root = render();

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);

  expect(root.getItemInstance('grif').getName()).toBe('grif');
  expect(root.getItemInstance('grif').getDragHeight()).toBe(30);
  expect(root.getItemInstance('grif').props.commonProps).toBe(commonProps);

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});
  expect(root.state.dragging).toBe(true);

  root._handleMouseMove({pageY: 600});
  await delay(30);

  root._handleMouseMove({pageY: 650});

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  root._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const reorderedList = [
    {name: 'tucker'},
    {name: 'church'},
    {name: 'simmons'},
    {name: 'sarge'},
    {name: 'caboose'},
    {name: 'grif'},
    {name: 'donut'}
  ];

  expect(onMoveEnd.mock.calls[0]).toEqual(
    [reorderedList, {name: 'caboose'}, 0, 4]
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(reorderedList);

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
  const root: DraggableList<*> = (TestUtils.renderIntoDocument(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});
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
      .map(e=>e.props.item)
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 600, preventDefault() {}});
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
  const root: DraggableList<*> = (ReactDOM.render(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});

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
  const root: DraggableList<*> = (ReactDOM.render(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});

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
  const root: DraggableList<*> = (ReactDOM.render(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});
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
  const root: DraggableList<*> = (ReactDOM.render(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});
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
  const root: DraggableList<*> = (ReactDOM.render(
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

  const renderedHandles: Array<TestTemplate> = (TestUtils.scryRenderedComponentsWithType(root, TestTemplate): any);
  renderedHandles[0].props.dragHandleProps.onMouseDown({pageY: 500, preventDefault() {}});

  await delay(100);

  root._handleMouseUp();
  await delay(1);

  expect((root.getItemInstance('caboose').getDOMNode().parentElement:any).style.position).toBe('absolute');

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
  expect((root.getItemInstance('lopez').getDOMNode().parentElement:any).style.position).toBe('relative');
});

test('updating commonProps works', () => {
  const onMoveEnd = jest.fn();

  const list = [
    {name: 'caboose'},
    {name: 'donut'}
  ];
  const div = document.createElement('div');
  const root: DraggableList<*> = (ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
      commonProps={{a: 5}}
    />,
    div
  ): any);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.item)
  ).toEqual(list);
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.commonProps)
  ).toEqual(list.map(() => ({a: 5})));

  ReactDOM.render(
    <DraggableList
      itemKey="name"
      list={list}
      template={TestTemplate}
      onMoveEnd={onMoveEnd}
      springConfig={springConfig}
      commonProps={{b: 6}}
    />,
    div
  );

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(e=>e.props.commonProps)
  ).toEqual(list.map(() => ({b: 6})));
});
