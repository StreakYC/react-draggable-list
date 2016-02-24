/* @flow */

import React from 'react';
import {Motion, spring} from 'react-motion';
import update from 'react-addons-update';
import DragHandle from './DragHandle';

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
  drag: ?{
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
      drag: null
    };
  }

  componentWillReceiveProps(newProps: Props) {
    let {drag} = this.state;
    if (drag) {
      const keyFn = this._getKeyFn();
      const dragKey = drag.itemKey;
      const newListHasDragItem = newProps.list.some(item => keyFn(item) === dragKey);
      if (!newListHasDragItem) {
        drag = null;
      }
    }
    this.setState({drag, list: newProps.list});
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
      drag: {
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
    const {list, drag} = this.state;
    if (drag) {
      const mouseY = pageY - drag.mouseOffset;
      const row = clamp(Math.round((mouseY - drag.startIndex*(FULL_HEIGHT-DRAG_HEIGHT)) / (DRAG_HEIGHT+MARGIN)), 0, list.length-1);
      const dragIndex = this._getDragIndex();
      const newList = update(list, {
        $splice: [[dragIndex, 1], [row, 0, list[dragIndex]]]
      });
      this.setState({drag: {...drag, mouseY}, list: newList});
    }
  };

  _handleMouseUp: Function = () => {
    window.removeEventListener('mouseup', this._handleMouseUp);
    window.removeEventListener('touchend', this._handleMouseUp);
    window.removeEventListener('touchmove', this._handleTouchMove);
    window.removeEventListener('mousemove', this._handleMouseMove);

    document.documentElement.style.cursor = '';
    // this._lastDelta = 0;

    const {onMoveEnd} = this.props;
    const {drag, list} = this.state;
    if (drag && onMoveEnd) {
      const dragIndex = this._getDragIndex();
      onMoveEnd(list, list[dragIndex], drag.startIndex, dragIndex);
    }
    this.setState({drag: null});
  };

  _getDragIndex(): number {
    const {list, drag} = this.state;
    if (!drag) {
      throw new Error("No drag happening");
    }
    const keyFn = this._getKeyFn();
    return list.map(keyFn).indexOf(drag.itemKey);
  }

  _getKeyFn(): (item: Object) => string {
    const {itemKey} = this.props;
    return typeof itemKey === 'function' ? itemKey : x => x[itemKey];
  }

  render() {
    const {springConfig, itemKey} = this.props;
    const {list, drag} = this.state;
    const Template = this.props.template;

    const keyFn = this._getKeyFn();

    const children = list.map((item, i) => {
      const key = keyFn(item);
      const selectedStyle = drag && drag.itemKey === key
        ? {
            itemSelected: spring(1, springConfig),
            y: drag.mouseY
          }
        : {
            itemSelected: spring(0, springConfig),
            y: spring(drag ?
              (drag.startIndex * (FULL_HEIGHT+MARGIN) + (i-drag.startIndex) * (DRAG_HEIGHT+MARGIN))
              : i * (FULL_HEIGHT+MARGIN), springConfig)
          };
      const style = {
        anySelected: spring(drag ? 1 : 0, springConfig),
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
                zIndex: drag && drag.itemKey === key ? list.length : i /*TODO fix wrong zindex after drop */
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
    return (
      <div
        style={{
          position: 'relative',
          height: `${list.length*(FULL_HEIGHT+MARGIN)}px`
        }}
        >
        {children}
      </div>
    );
  }
}
