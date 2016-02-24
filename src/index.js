/* @flow */

import React from 'react';
import {findDOMNode} from 'react-dom';
import {Motion, spring} from 'react-motion';
import update from 'react-addons-update';
import saveRefs from 'react-save-refs';
import DragHandle from './DragHandle';
import OnUpdate from './OnUpdate';

const FULL_HEIGHT = 70;
const DRAG_HEIGHT = 30;

const DEFAULT_HEIGHT = {natural: 100, drag: 30};

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

type Props = {
  itemKey: string|(item: Object)=>string;
  template: Function;
  list: Array<Object>;
  onMoveEnd?: ?(newList: Array<Object>, movedItem: Object, oldIndex: number, newIndex: number) => void;
  container?: ?() => ?HTMLElement;
  springConfig: Object;
  padding: number;
};
type State = {
  list: Array<Object>;
  useAbsolutePositioning: boolean;
  dragging: boolean;
  lastDrag: ?{
    itemKey: string;
    startIndex: number;
    mouseY: number;
    mouseOffset: number;
  };
};
type DefaultProps = {
  springConfig: Object;
  padding: number;
};
export default class DraggableList extends React.Component {
  props: Props;
  state: State;
  static propTypes = {
    itemKey: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]).isRequired,
    template: React.PropTypes.func,
    list: React.PropTypes.array.isRequired,
    onMoveEnd: React.PropTypes.func,
    container: React.PropTypes.func,
    springConfig: React.PropTypes.object,
    padding: React.PropTypes.number
  };
  static defaultProps: DefaultProps = {
    springConfig: {stiffness: 300, damping: 50},
    padding: 10
  };
  _itemRefs: Map<string, Object> = new Map();
  _heights: Map<string, {natural: number, drag: number}> = new Map();

  constructor(props: Props) {
    super(props);
    this.state = {
      list: props.list,
      useAbsolutePositioning: false,
      dragging: false,
      lastDrag: null
    };
  }

  componentWillReceiveProps(newProps: Props) {
    let {dragging, lastDrag} = this.state;
    if (dragging && lastDrag) {
      const keyFn = this._getKeyFn();
      const dragKey = lastDrag.itemKey;
      const newListHasDragItem = newProps.list.some(item => keyFn(item) === dragKey);
      if (!newListHasDragItem) {
        dragging = false;
        lastDrag = null;
      }
    }
    this.setState({dragging, lastDrag, list: newProps.list});
  }

  _handleTouchStart(itemIndex: number, pressY: number, e: Object) {
    event.stopPropagation();
    this._handleStartDrag(itemIndex, pressY, e.touches[0]);
  }

  _handleMouseDown(itemIndex: number, pressY: number, event: Object) {
    event.preventDefault();
    this._handleStartDrag(itemIndex, pressY, event.pageY);
  }

  _handleStartDrag(itemIndex: number, pressY: number, pageY: number) {
    document.documentElement.style.cursor = 'move';
    window.addEventListener('mouseup', this._handleMouseUp);
    window.addEventListener('touchend', this._handleMouseUp);
    window.addEventListener('touchmove', this._handleTouchMove);
    window.addEventListener('mousemove', this._handleMouseMove);

    const keyFn = this._getKeyFn();

    if (this._heights.size === 0) {
      this._heights = new Map(
        this.state.list.map(item => {
          const key = keyFn(item);
          const ref = this._itemRefs.get(key);
          return [key, {
            natural: ref ? findDOMNode(ref).offsetHeight : 100,
            drag: ref && ref.getDragHeight ? ref.getDragHeight() : 30
          }];
        })
      );
    }

    this.setState({
      useAbsolutePositioning: true,
      dragging: true,
      lastDrag: {
        itemKey: keyFn(this.state.list[itemIndex]),
        startIndex: itemIndex,
        mouseY: pressY,
        mouseOffset: pageY - pressY
      }
    });
  }

  _handleTouchMove: Function = (e) => {
    e.preventDefault();
    this._handleMouseMove(e.touches[0]);
  };

  _handleMouseMove: Function = ({pageY}) => {
    const {padding} = this.props;
    const {list, dragging, lastDrag} = this.state;
    if (dragging && lastDrag) {
      const mouseY = pageY - lastDrag.mouseOffset;
      const dragIndex = this._getDragIndex();
      const naturalPosition = this._getDistanceDuringDrag(lastDrag.startIndex, dragIndex);

      // 1 down, -1 up, 0 neither
      const movementFromNatural = mouseY-naturalPosition;
      const direction = movementFromNatural > 0 ? 1 :
        movementFromNatural < 0 ? -1 : 0;
      let newIndex = dragIndex;
      if (direction !== 0) {
        const keyFn = this._getKeyFn();
        let reach = Math.abs(movementFromNatural);
        for (let i=dragIndex+direction; i < list.length && i >= 0; i += direction) {
          const iDragHeight = (this._heights.get(keyFn(list[i])) || DEFAULT_HEIGHT).drag;
          if (reach < iDragHeight/2 + padding) break;
          reach -= iDragHeight + padding;
          newIndex = i;
        }
      }
      let newList = list;
      if (newIndex !== dragIndex) {
        newList = update(list, {
          $splice: [[dragIndex, 1], [newIndex, 0, list[dragIndex]]]
        });
      }
      this.setState({lastDrag: {...lastDrag, mouseY}, list: newList});
    }
  };

  _handleMouseUp: Function = () => {
    window.removeEventListener('mouseup', this._handleMouseUp);
    window.removeEventListener('touchend', this._handleMouseUp);
    window.removeEventListener('touchmove', this._handleTouchMove);
    window.removeEventListener('mousemove', this._handleMouseMove);

    document.documentElement.style.cursor = '';
    this._lastScrollDelta = 0;

    const {onMoveEnd} = this.props;
    const {dragging, lastDrag, list} = this.state;
    if (dragging && lastDrag && onMoveEnd) {
      const dragIndex = this._getDragIndex();
      if (lastDrag.startIndex !== dragIndex) {
        onMoveEnd(list, list[dragIndex], lastDrag.startIndex, dragIndex);
      }
    }
    this.setState({dragging: false});
  };

  _lastScrollDelta: number = 0;
  _adjustScrollAtEnd(delta: number) {
    const {dragging, lastDrag, useAbsolutePositioning} = this.state;
    if (dragging || !lastDrag || !useAbsolutePositioning) return;
    const {container} = this.props;
    if (!container) return;
    const containerEl = container();
    if (!containerEl) return;

    const frameDelta = Math.round(delta - this._lastScrollDelta);
    containerEl.scrollTop += frameDelta;
    this._lastScrollDelta += frameDelta;
  };

  _getDragIndex(): number {
    const {list, lastDrag} = this.state;
    if (!lastDrag) {
      throw new Error("No drag happened");
    }
    const keyFn = this._getKeyFn();
    return list.map(keyFn).indexOf(lastDrag.itemKey);
  }

  _getDistance(start: number, end: number, dragging: boolean): number {
    if (end < start) {
      return -this._getDistance(end, start, dragging);
    }

    const {padding} = this.props;
    const {list} = this.state;
    const keyFn = this._getKeyFn();
    let distance = 0;
    for (let i=start; i < end; i++) {
      const height = this._heights.get(keyFn(list[i])) || DEFAULT_HEIGHT;
      distance += (dragging ? height.drag : height.natural) + padding;
    }
    return distance;
  }

  _getDistanceDuringDrag(dragStartIndex: number, index: number): number {
    return this._getDistance(0, dragStartIndex, false) +
      this._getDistance(dragStartIndex, index, true);
  }

  _getKeyFn(): (item: Object) => string {
    const {itemKey} = this.props;
    return typeof itemKey === 'function' ? itemKey : x => x[itemKey];
  }

  render() {
    const {springConfig, itemKey, container, padding} = this.props;
    const {list, dragging, lastDrag, useAbsolutePositioning} = this.state;
    const Template = this.props.template;

    const keyFn = this._getKeyFn();
    const anySelected = spring(dragging ? 1 : 0, springConfig);

    const children = list.map((item, i) => {
      const key = keyFn(item);
      const selectedStyle = dragging && lastDrag && lastDrag.itemKey === key
        ? {
            itemSelected: spring(1, springConfig),
            y: lastDrag.mouseY
          }
        : {
            itemSelected: spring(0, springConfig),
            y: spring(dragging && lastDrag ?
              this._getDistanceDuringDrag(lastDrag.startIndex, i)
              : this._getDistance(0, i, false), springConfig)
          };
      const style = {
        anySelected,
        ...selectedStyle
      };
      const makeDragHandle = y => el => (
        <DragHandle
          onMouseDown={e => this._handleMouseDown(i, y, e)}
          onTouchStart={e => this._handleTouchStart(i, y, e)}
          >
          {el}
        </DragHandle>
      );
      const height = this._heights.get(key) || DEFAULT_HEIGHT;
      return (
        <Motion style={style} key={key}>
          {({itemSelected, anySelected, y}) =>
            <div
              style={{
                position: useAbsolutePositioning ? 'absolute' : 'relative',
                boxSizing: 'border-box',
                top: useAbsolutePositioning ? `${y}px` : '0',
                marginBottom: `${padding}px`,
                height: useAbsolutePositioning ?
                  `${anySelected*(height.drag-height.natural)+height.natural}px`
                  : 'auto',
                zIndex: lastDrag && lastDrag.itemKey === key ? list.length : i
              }}
              >
              <Template
                ref={saveRefs(this._itemRefs, key)}
                item={item}
                itemSelected={itemSelected}
                anySelected={anySelected}
                dragHandle={makeDragHandle(y)}
                />
            </div>
          }
        </Motion>
      );
    });

    let adjustScroll = 0;
    if (!dragging && lastDrag && useAbsolutePositioning) {
      const dragIndex = this._getDragIndex();
      adjustScroll = spring(
        this._getDistance(lastDrag.startIndex, dragIndex, false) -
        this._getDistance(lastDrag.startIndex, dragIndex, true),
        springConfig
      );
    }

    const fullContainerHeight = `${this._getDistance(0, list.length, false)}px`;
    return (
      <div style={{position: 'relative'}}>
        {container && <Motion style={{adjustScroll, anySelected}}>
          {({adjustScroll, anySelected}) =>
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: useAbsolutePositioning ? fullContainerHeight : '0'
              }}
              >
              <OnUpdate cb={() => {
                if (!dragging && anySelected === 0 && useAbsolutePositioning) {
                  this._heights.clear();
                  this.setState({useAbsolutePositioning: false});
                }
                this._adjustScrollAtEnd(adjustScroll);
              }} />
            </div>
          }
        </Motion>}
        {children}
      </div>
    );
  }
}
