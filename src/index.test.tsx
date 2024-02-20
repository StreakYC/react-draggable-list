/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-use-before-define, @typescript-eslint/no-empty-function */

import delay from 'pdelay';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as TestUtils from 'react-dom/test-utils';
import DraggableList from '../src';

interface Item {
  name: string;
  extra?: number;
}

interface TestTemplateProps {
  item: Item;
  dragHandleProps: any;
  commonProps: any;
}

class TestTemplate extends React.Component<TestTemplateProps> {
  private readonly _elRef = React.createRef<HTMLDivElement>();

  render() {
    const { item, dragHandleProps } = this.props;
    return (
      <div ref={this._elRef} className="item" {...dragHandleProps}>
        {item.name}
      </div>
    );
  }

  getName() {
    return this.props.item.name;
  }

  getDragHeight() {
    return 30;
  }

  getDOMNode(): HTMLDivElement {
    return this._elRef.current!;
  }

  shouldComponentUpdate(nextProps: TestTemplateProps) {
    return this.props.item !== nextProps.item;
  }

  componentDidMount() {
    const el = this._elRef.current!;
    Object.defineProperty(el, 'offsetHeight', {
      get: () => 115,
    });
  }
}

const springConfig = { stiffness: 1500, damping: 50 };

test('drag works', async () => {
  let _scrollTop = 0;
  const containerEl: any = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    },
  };

  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  const commonProps = { a: 'foo' };

  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
        container={() => containerEl}
        commonProps={commonProps}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  expect(root.getItemInstance('grif').getName()).toBe('grif');
  expect(root.getItemInstance('grif').getDragHeight()).toBe(30);
  expect(root.getItemInstance('grif').props.commonProps).toBe(commonProps);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });
  expect(root.state.dragging).toBe(true);

  (root as any)._handleMouseMove({ pageY: 600 });
  await delay(30);

  (root as any)._handleMouseMove({ pageY: 650 });

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const reorderedList = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'caboose' },
    { name: 'grif' },
    { name: 'donut' },
  ];

  expect(onMoveEnd.mock.calls[0]).toEqual([
    reorderedList,
    { name: 'caboose' },
    0,
    4,
  ]);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);

  expect(_scrollTop).toBe(0);
  await delay(30);
  expect(_scrollTop).toBeGreaterThan(20);
});

test('two drags work', async () => {
  let _scrollTop = 0;
  const containerEl: any = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    },
  };

  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];

  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        onMoveEnd={onMoveEnd}
        template={TestTemplate}
        springConfig={springConfig}
        container={() => containerEl}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });
  expect(root.state.dragging).toBe(true);

  (root as any)._handleMouseMove({ pageY: 600 });
  await delay(30);
  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const reorderedList = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'caboose' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  expect(onMoveEnd.mock.calls[0]).toEqual([
    reorderedList,
    { name: 'caboose' },
    0,
    2,
  ]);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(false);
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 600,
    preventDefault() {},
  });
  expect(root.state.dragging).toBe(true);
  (root as any)._handleMouseMove({ pageY: 650 });
  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(2);

  const reorderedList2 = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'caboose' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  expect(onMoveEnd.mock.calls[1]).toEqual([
    reorderedList2,
    { name: 'caboose' },
    2,
    3,
  ]);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList2);

  expect(_scrollTop).toBe(0);
  await delay(30);
  expect(_scrollTop).toBeGreaterThan(20);
});

test('props reordered during drag works', () => {
  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });

  list = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'caboose', extra: 1 },
    { name: 'donut' },
  ];
  render();

  (root as any)._handleMouseMove({ pageY: 450 });
  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const reorderedList = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'caboose', extra: 1 },
    { name: 'grif' },
    { name: 'donut' },
  ];
  expect(onMoveEnd.mock.calls[0]).toEqual([
    reorderedList,
    { name: 'caboose', extra: 1 },
    5,
    4,
  ]);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);
});

test('item removed during drag works', () => {
  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });

  list = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif', extra: 2 },
    { name: 'donut' },
  ];
  render();

  (root as any)._handleMouseMove({ pageY: 650 });
  const reorderedList = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif', extra: 2 },
    { name: 'donut' },
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);

  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);
});

test('item removed before drag end works', async () => {
  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });
  (root as any)._handleMouseMove({ pageY: 650 });
  await delay(100);

  // eslint-disable-next-line require-atomic-updates
  list = [
    { name: 'caboose', extra: 3 },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif', extra: 2 },
  ];
  render();
  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const reorderedList = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'caboose', extra: 3 },
    { name: 'grif', extra: 2 },
  ];
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(reorderedList);
});

test('dragged item removed after drag during animation works', () => {
  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });
  (root as any)._handleMouseMove({ pageY: 650 });

  expect(root.state.dragging).toBe(true);
  expect(onMoveEnd).toHaveBeenCalledTimes(0);
  (root as any)._handleMouseUp();
  expect(root.state.dragging).toBe(false);
  expect(onMoveEnd).toHaveBeenCalledTimes(1);

  const listMinusOne = [
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];
  list = listMinusOne;
  render();

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(listMinusOne);
});

test('list is shown with correct positions after being fully changed during animation', async () => {
  let list: Item[] = [
    { name: 'caboose' },
    { name: 'tucker' },
    { name: 'church' },
    { name: 'simmons' },
    { name: 'sarge' },
    { name: 'grif' },
    { name: 'donut' },
  ];

  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;
  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });

  await delay(100);

  (root as any)._handleMouseUp();
  await delay(1);

  expect(
    root.getItemInstance('caboose').getDOMNode().parentElement!.style.position
  ).toBe('absolute');

  list = [{ name: 'lopez' }, { name: "o'malley" }];
  render();
  while (
    root.getItemInstance('lopez').getDOMNode().parentElement!.style.position ===
    'absolute'
  ) {
    await delay(10);
  }
  expect(
    root.getItemInstance('lopez').getDOMNode().parentElement!.style.position
  ).toBe('relative');
});

test('updating commonProps works', () => {
  let list: Item[] = [{ name: 'caboose' }, { name: 'donut' }];
  let commonProps: any = { a: 5 };
  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
        commonProps={commonProps}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.item
    )
  ).toEqual(list);
  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.commonProps
    )
  ).toEqual(list.map(() => ({ a: 5 })));

  commonProps = { b: 6 };
  render();

  expect(
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate).map(
      (e) => e.props.commonProps
    )
  ).toEqual(list.map(() => ({ b: 6 })));
});

test('onDragEnd and onDragStart callbacks are correctly called', () => {
  let _scrollTop = 0;
  const containerEl: any = {
    get scrollTop() {
      return _scrollTop;
    },
    set scrollTop(x) {
      _scrollTop = x;
    },
  };

  let list: Item[] = [
    { name: 'alice' },
    { name: 'bob' },
    { name: 'charlie' },
    { name: 'deb' },
    { name: 'ethan' },
  ];

  const div = document.createElement('div');

  const onMoveEnd = jest.fn((newList) => {
    list = newList;
    render();
  });

  const onDragStart = jest.fn(() => {

  });

  const onDragEnd = jest.fn(() => {

  });

  const rootRef = React.createRef<DraggableList<Item, any, TestTemplate>>();
  function render() {
    ReactDOM.render(
      <DraggableList
        ref={rootRef}
        itemKey="name"
        list={list}
        template={TestTemplate}
        onMoveEnd={onMoveEnd}
        springConfig={springConfig}
        container={() => containerEl}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />,
      div
    );
  }
  render();
  const root = rootRef.current!;

  const renderedHandles: Array<TestTemplate> =
    TestUtils.scryRenderedComponentsWithType(root, TestTemplate) as any;

  expect(onDragStart).toHaveBeenCalledTimes(0);

  renderedHandles[0].props.dragHandleProps.onMouseDown({
    pageY: 500,
    preventDefault() {},
  });

  expect(onDragStart).toHaveBeenCalledTimes(1);
  expect(onDragStart).toHaveBeenLastCalledWith({name: 'alice'});
  expect(onDragEnd).toHaveBeenCalledTimes(0);

  (root as any)._handleMouseMove({ pageY: 600 });

  (root as any)._handleMouseUp();

  expect(onDragEnd).toHaveBeenCalledTimes(1);
  expect(onDragEnd).toHaveBeenLastCalledWith({name: 'alice'});

});
