/* @flow */

import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import {Motion, spring} from 'react-motion';
import update from 'react-addons-update';
import saveRefs from 'react-save-refs';
import DragHandle from './DragHandle';
import OnUpdate from './OnUpdate';
import MoveContainer from './MoveContainer';

const DEFAULT_HEIGHT = {natural: 200, drag: 30};

const AUTOSCROLL_REGION_SIZE = 30;
const AUTOSCROLL_MAX_SPEED = 15;

function getScrollSpeed(distance) {
  // If distance is zero, then the result is the max speed. Otherwise,
  // the result tapers toward zero as it gets closer to the opposite
  // edge of the region.
  return Math.round(AUTOSCROLL_MAX_SPEED -
    (AUTOSCROLL_MAX_SPEED/AUTOSCROLL_REGION_SIZE) * distance);
}

type Drag = {
  itemKey: string;
  startIndex: number;
  startListKeys: Array<string>;
  startY: number;
  mouseY: number;
  mouseOffset: number;
};

type Props = {
  itemKey: string|(item: Object)=>string;
  template: Function;
  list: Array<Object>;
  onMoveEnd?: ?(newList: Array<Object>, movedItem: Object, oldIndex: number, newIndex: number) => void;
  container?: ?() => ?HTMLElement;
  springConfig: Object;
  padding: number;
  unsetZIndex: boolean;
  additionalProps: Object;
};
type State = {
  list: Array<Object>;
  useAbsolutePositioning: boolean;
  dragging: boolean;
  lastDrag: ?Drag;
};
type DefaultProps = {
  springConfig: Object;
  padding: number;
  unsetZIndex: boolean;
};
export default class DraggableList extends React.Component {
  props: Props;
  state: State;
  static propTypes = {
    itemKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
    template: PropTypes.func,
    list: PropTypes.array.isRequired,
    onMoveEnd: PropTypes.func,
    container: PropTypes.func,
    springConfig: PropTypes.object,
    padding: PropTypes.number,
    unsetZIndex: PropTypes.bool,
    additionalProps: PropTypes.object
  };
  static defaultProps: DefaultProps = {
    springConfig: {stiffness: 300, damping: 50},
    padding: 10,
    unsetZIndex: false
  };
  _itemRefs: Map<string, MoveContainer> = new Map();
  _heights: Map<string, {natural: number, drag: number}> = new Map();
  _autoScrollerTimer: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      list: props.list,
      useAbsolutePositioning: false,
      dragging: false,
      lastDrag: null
    };
  }

  getItemInstance(key: string): Object {
    const ref = this._itemRefs.get(key);
    if (!ref) throw new Error('key not found');
    return ref.getTemplate();
  }

  componentWillReceiveProps(newProps: Props) {
    let {dragging, lastDrag} = this.state;
    let {list} = newProps;

    check: if (lastDrag) {
      let newDragIndex;
      try {
        newDragIndex = this._getDragIndex(list);
      } catch (err) {
        dragging = false;
        lastDrag = null;
        break check;
      }

      if (dragging) {
        const currentDragIndex = this._getDragIndex();
        if (currentDragIndex !== newDragIndex) {
          // Let's change the list so that the new drag index will be the same as
          // the current so that the dragged item doesn't jump on the screen.
          list = update(list, {
            $splice: [[newDragIndex, 1], [currentDragIndex, 0, list[newDragIndex]]]
          });
        }
      }
    }
    this.setState({dragging, lastDrag, list});
  }

  componentWillUnmount() {
    this._handleMouseUp();
  }

  _handleTouchStart(itemKey: string, pressY: ?number, e: Object) {
    event.stopPropagation();
    this._handleStartDrag(itemKey, pressY, e.touches[0].pageY);
  }

  _handleMouseDown(itemKey: string, pressY: ?number, event: Object) {
    event.preventDefault();
    this._handleStartDrag(itemKey, pressY, event.pageY);
  }

  _handleStartDrag(itemKey: string, pressY: ?number, pageY: number) {
    if (document.documentElement) document.documentElement.style.cursor = 'move';
    window.addEventListener('mouseup', this._handleMouseUp);
    window.addEventListener('touchend', this._handleMouseUp);
    window.addEventListener('touchmove', this._handleTouchMove);
    window.addEventListener('mousemove', this._handleMouseMove);

    // If an element has focus while we drag around the parent, some browsers
    // try to scroll the parent element to keep the focused element in view.
    // Stop that.
    {
      const listEl = findDOMNode(this);
      if (
        listEl.contains && document.activeElement &&
        listEl.contains(document.activeElement)
      ) {
        document.activeElement.blur();
      }
    }

    const keyFn = this._getKeyFn();

    if (this._heights.size === 0) {
      this._heights = new Map(
        this.state.list.map(item => {
          const key = keyFn(item);
          const containerRef = this._itemRefs.get(key);
          const ref = containerRef ? containerRef.getTemplate() : null;
          const natural = ref ?
            findDOMNode(ref).offsetHeight : DEFAULT_HEIGHT.natural;
          const drag = ref && (typeof ref.getDragHeight === 'function') && ref.getDragHeight() || natural;
          return [key, {natural, drag}];
        })
      );
    }

    const itemIndex = this.state.list.map(keyFn).indexOf(itemKey);

    const startY = pressY == null ?
      this._getDistance(0, itemIndex, false) : pressY;

    const containerEl = this._getContainer();
    const containerScroll = !containerEl || containerEl === document.body ?
      0 : containerEl.scrollTop;

    // Need to re-render once before we start dragging so that the `y` values
    // are set using the correct _heights and then can animate from there.
    this.forceUpdate(() => {
      this.setState({
        useAbsolutePositioning: true,
        dragging: true,
        lastDrag: {
          itemKey: itemKey,
          startIndex: itemIndex,
          startListKeys: this.state.list.map(keyFn),
          startY,
          mouseY: startY,
          mouseOffset: pageY - startY + containerScroll
        }
      });
    });
  }

  _handleTouchMove: Function = (e) => {
    e.preventDefault();
    this._handleMouseMove(e.touches[0]);
  };

  _handleMouseMove: Function = ({pageY, clientY}) => {
    const {padding} = this.props;
    const {list, dragging, lastDrag} = this.state;
    if (!dragging || !lastDrag) return;

    const containerEl = this._getContainer();
    const dragIndex = this._getDragIndex();
    const naturalPosition = this._getDistanceDuringDrag(lastDrag, dragIndex);

    clearInterval(this._autoScrollerTimer);

    // If the user has the mouse near the top or bottom of the container and
    // not at the end of the list, then autoscroll.
    if (dragIndex !== 0 && dragIndex !== list.length-1) {
      let scrollSpeed = 0;

      const containerRect = containerEl && containerEl !== document.body &&
        containerEl.getBoundingClientRect ?
          containerEl.getBoundingClientRect() :
          {top: 0, bottom: Infinity};

      // Get the lowest of the screen top and the container top.
      const top = Math.max(0, containerRect.top);

      const distanceFromTop = clientY-top;
      if (distanceFromTop > 0 && distanceFromTop < AUTOSCROLL_REGION_SIZE) {
        scrollSpeed = -1 * getScrollSpeed(distanceFromTop);
      } else {
        // Get the lowest of the screen bottom and the container bottom.
        const bottom = Math.min(window.innerHeight, containerRect.bottom);
        const distanceFromBottom = bottom-clientY;
        if (distanceFromBottom > 0 && distanceFromBottom < AUTOSCROLL_REGION_SIZE) {
          scrollSpeed = getScrollSpeed(distanceFromBottom);
        }
      }

      if (scrollSpeed !== 0) {
        this._scrollContainer(scrollSpeed);
        this._autoScrollerTimer = setTimeout(() => {
          this._handleMouseMove({
            pageY: pageY + (containerEl===document.body?scrollSpeed:0),
            clientY
          });
        }, 16);
      }
    }

    const containerScroll = !containerEl || containerEl === document.body ?
      0 : containerEl.scrollTop;
    const mouseY = pageY - lastDrag.mouseOffset + containerScroll;

    const movementFromNatural = mouseY-naturalPosition;
    // 1 down, -1 up, 0 neither
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
  };

  _handleMouseUp: Function = () => {
    clearInterval(this._autoScrollerTimer);
    window.removeEventListener('mouseup', this._handleMouseUp);
    window.removeEventListener('touchend', this._handleMouseUp);
    window.removeEventListener('touchmove', this._handleTouchMove);
    window.removeEventListener('mousemove', this._handleMouseMove);

    if (document.documentElement) document.documentElement.style.cursor = '';
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

  _scrollContainer(delta: number) {
    const containerEl = this._getContainer();
    if (!containerEl) return;
    if (window.scrollBy && containerEl === document.body) {
      window.scrollBy(0, delta);
    } else {
      containerEl.scrollTop += delta;
    }
  }

  _lastScrollDelta: number = 0;
  _adjustScrollAtEnd(delta: number) {
    const frameDelta = Math.round(delta - this._lastScrollDelta);
    this._scrollContainer(frameDelta);
    this._lastScrollDelta += frameDelta;
  }

  _getDragIndex(list: ?Array<Object>, lastDrag: ?Drag): number {
    if (!list) list = this.state.list;
    if (!lastDrag) lastDrag = this.state.lastDrag;
    if (!lastDrag) {
      throw new Error('No drag happened');
    }
    const keyFn = this._getKeyFn();
    const {itemKey} = lastDrag;
    for (let i=0, len=list.length; i < len; i++) {
      if (keyFn(list[i]) === itemKey) {
        return i;
      }
    }
    throw new Error('Failed to find drag index');
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

  _getDistanceDuringDrag(lastDrag: Drag, index: number): number {
    const keyFn = this._getKeyFn();
    const {list} = this.state;

    let offset = 0;
    if (this._getDragIndex() < lastDrag.startIndex) {
      const dragItemHeight = this._heights.get(lastDrag.itemKey) || DEFAULT_HEIGHT;
      const newCenterHeight =
        this._heights.get(keyFn(list[lastDrag.startIndex])) || DEFAULT_HEIGHT;
      offset = dragItemHeight.drag - newCenterHeight.drag;
    }
    return lastDrag.startY + offset +
      this._getDistance(lastDrag.startIndex, index, true);
  }

  _getContainer(): ?HTMLElement {
    const {container} = this.props;
    return container ? container() : null;
  }

  _getKeyFn(): (item: Object) => string {
    const {itemKey} = this.props;
    return typeof itemKey === 'function' ? itemKey : x => x[itemKey];
  }

  render() {
    const {springConfig, container, padding, template, unsetZIndex, additionalProps} = this.props;
    const {list, dragging, lastDrag, useAbsolutePositioning} = this.state;

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
          y: (useAbsolutePositioning ? spring : x=>x)(dragging && lastDrag ?
              this._getDistanceDuringDrag(lastDrag, i)
              : this._getDistance(0, i, false), springConfig)
        };
      const style = {
        anySelected,
        ...selectedStyle
      };
      const makeDragHandle = (el, getY: ()=>?number) => (
        <DragHandle
          onMouseDown={e => this._handleMouseDown(key, getY(), e)}
          onTouchStart={e => this._handleTouchStart(key, getY(), e)}
          >
          {el}
        </DragHandle>
      );
      const height = this._heights.get(key) || DEFAULT_HEIGHT;
      return (
        <Motion
          style={style} key={key}
          children={({itemSelected, anySelected, y}) =>
            <MoveContainer
              ref={saveRefs(this._itemRefs, key)}
              y={useAbsolutePositioning ? y : null}
              template={template}
              padding={padding}
              item={item}
              itemSelected={itemSelected}
              anySelected={anySelected}
              height={height}
              zIndex={unsetZIndex && !useAbsolutePositioning ? 'auto' :
                (lastDrag && lastDrag.itemKey === key ? list.length : i)
              }
              makeDragHandle={makeDragHandle}
              additionalProps={additionalProps}
            />
          }
        />
      );
    });

    let adjustScroll = 0;
    if (!dragging && lastDrag && useAbsolutePositioning) {
      const dragIndex = this._getDragIndex();
      adjustScroll = spring(
        this._getDistance(0, dragIndex, false)
        - lastDrag.mouseY,
        springConfig
      );
    }

    const fullContainerHeight = `${this._getDistance(0, list.length, false)}px`;
    return (
      <div style={{position: 'relative'}}>
        <Motion
          style={{adjustScroll, anySelected}}
          onRest={() => {
            if (!dragging) {
              this._heights.clear();
              this.setState({useAbsolutePositioning: false});
            }
          }}
          children={({adjustScroll}) =>
            <div
              style={{
                display: useAbsolutePositioning ? 'block' : 'none',
                height: useAbsolutePositioning ? fullContainerHeight : '0px'
              }}
            >
              {container && <OnUpdate cb={() => {
                if (!dragging && lastDrag && useAbsolutePositioning) {
                  this._adjustScrollAtEnd(adjustScroll);
                }
              }} />}
            </div>
          }
        />
        {children}
      </div>
    );
  }
}
