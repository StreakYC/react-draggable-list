/* @flow */

import React from 'react';
import {Motion, spring} from 'react-motion';
import update from 'react-addons-update';
import DragHandle from './DragHandle';
import OnUpdate from './OnUpdate';

const MARGIN = 10;
const FULL_HEIGHT = 70;
const DRAG_HEIGHT = 30;

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
};
type State = {
  list: Array<Object>;
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
    springConfig: React.PropTypes.object
  };
  static defaultProps: DefaultProps = {
    springConfig: {stiffness: 300, damping: 50}
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      list: props.list,
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
    this.setState({
      dragging: true,
      lastDrag: {
        itemKey: this._getKeyFn()(this.state.list[itemIndex]),
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
    const {list, dragging, lastDrag} = this.state;
    if (dragging && lastDrag) {
      const mouseY = pageY - lastDrag.mouseOffset;
      const row = clamp(Math.round((mouseY - lastDrag.startIndex*(FULL_HEIGHT-DRAG_HEIGHT)) / (DRAG_HEIGHT+MARGIN)), 0, list.length-1);
      const dragIndex = this._getDragIndex();
      const newList = update(list, {
        $splice: [[dragIndex, 1], [row, 0, list[dragIndex]]]
      });
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
      onMoveEnd(list, list[dragIndex], lastDrag.startIndex, dragIndex);
    }
    this.setState({dragging: false});
  };

  _lastScrollDelta: number = 0;
  _adjustScrollAtEnd(delta: number) {
    const {dragging, lastDrag} = this.state;
    if (dragging || !lastDrag) return;
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

  _getKeyFn(): (item: Object) => string {
    const {itemKey} = this.props;
    return typeof itemKey === 'function' ? itemKey : x => x[itemKey];
  }

  render() {
    const {springConfig, itemKey, container} = this.props;
    const {list, dragging, lastDrag} = this.state;
    const Template = this.props.template;

    const keyFn = this._getKeyFn();

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
              (lastDrag.startIndex * (FULL_HEIGHT+MARGIN) +
              (i-lastDrag.startIndex) * (DRAG_HEIGHT+MARGIN))
              : i * (FULL_HEIGHT+MARGIN), springConfig)
          };
      const style = {
        anySelected: spring(dragging ? 1 : 0, springConfig),
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
      return (
        <Motion style={style} key={key}>
          {({itemSelected, anySelected, y}) =>
            <div
              style={{
                position: 'absolute',
                boxSizing: 'border-box',
                top: `${y}px`,
                height: anySelected === 0 ? 'auto'
                  : `${anySelected*(DRAG_HEIGHT-FULL_HEIGHT)+FULL_HEIGHT}px`,
                zIndex: lastDrag && lastDrag.itemKey === key ? list.length : i
              }}
              >
              <Template
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

    const adjustScroll = dragging || !lastDrag ? 0 : spring(
      (this._getDragIndex() - lastDrag.startIndex) * (FULL_HEIGHT-DRAG_HEIGHT),
      springConfig
    );

    return (
      <div
        style={{
          position: 'relative',
          height: `${list.length*(FULL_HEIGHT+MARGIN)}px`
        }}
        >
        {container && <Motion style={{adjustScroll}}>
          {({adjustScroll}) =>
            <OnUpdate
              cb={() => this._adjustScrollAtEnd(adjustScroll)} />
          }
        </Motion>}
        {children}
      </div>
    );
  }
}
