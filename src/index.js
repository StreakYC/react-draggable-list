/* @flow */
/* eslint react/prop-types: "error" */

import * as React from 'react';
import PropTypes from 'prop-types';
import {Motion, spring} from 'react-motion';
import update from 'immutability-helper';
import MultiRef from 'react-multi-ref';
import OnUpdate from './OnUpdate';
import MoveContainer from './MoveContainer';

type HeightData = {|
  natural: number;
  drag: number;
|};

const DEFAULT_HEIGHT: HeightData = {natural: 200, drag: 30};

function getScrollSpeed(distance, speed, size) {
  // If distance is zero, then the result is the max speed. Otherwise,
  // the result tapers toward zero as it gets closer to the opposite
  // edge of the region.
  return Math.round(speed - (speed / size) * distance);
}

type Drag = {
  itemKey: string;
  startIndex: number;
  startListKeys: Array<string>;
  startY: number;
  mouseY: number;
  mouseOffset: number;
};

export type TemplateProps<I,C> = {
  item: I;
  itemSelected: number;
  anySelected: number;
  dragHandleProps: Object;
  commonProps: C;
};

type Props<I,C,T> = {
  itemKey: string|(item: I)=>string;
  template: Class<T>;
  list: $ReadOnlyArray<I>;
  onMoveEnd?: ?(newList: $ReadOnlyArray<I>, movedItem: I, oldIndex: number, newIndex: number) => void;
  container?: ?() => ?HTMLElement;
  constrainDrag: boolean;
  springConfig: Object;
  padding: number;
  unsetZIndex: boolean;
  autoScrollMaxSpeed: number;
  autoScrollRegionSize: number;
  commonProps?: C;
};
type State<I> = {
  list: $ReadOnlyArray<I>;
  useAbsolutePositioning: boolean;
  dragging: boolean;
  lastDrag: ?Drag;
  heights: ?{[key: string]: HeightData};
};
type DefaultProps = {
  springConfig: Object;
  constrainDrag: boolean;
  padding: number;
  unsetZIndex: boolean;
  autoScrollMaxSpeed: number;
  autoScrollRegionSize: number;
};
export default class DraggableList<I,C=*,T:React.Component<$Shape<TemplateProps<I,C>>,*>=*> extends React.Component<Props<I,C,T>, State<I>> {
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
    constrainDrag: PropTypes.bool,
    padding: PropTypes.number,
    unsetZIndex: PropTypes.bool,
    autoScrollMaxSpeed: PropTypes.number.isRequired,
    autoScrollRegionSize: PropTypes.number.isRequired,
    commonProps: PropTypes.object
  };
  static defaultProps: DefaultProps = {
    springConfig: {stiffness: 300, damping: 50},
    padding: 10,
    unsetZIndex: false,
    constrainDrag: false,
    autoScrollMaxSpeed: 15,
    autoScrollRegionSize: 30
  };
  _itemRefs: MultiRef<string, MoveContainer<I,any,T>> = new MultiRef();
  _autoScrollerTimer: any;

  _listRef = React.createRef();

  constructor(props: Props<I,C,T>) {
    super(props);
    this.state = {
      list: props.list,
      useAbsolutePositioning: false,
      dragging: false,
      lastDrag: null,
      heights: null
    };
  }

  getItemInstance(key: string): T {
    const ref = this._itemRefs.map.get(key);
    if (!ref) throw new Error('key not found');
    return ref.getTemplate();
  }

  static TODO_getDerivedStateFromProps<I,C,T>(newProps: Props<I,C,T>, state: State<I>): $Shape<State<I>>|null {
    let {list} = newProps;

    // TODO if user doesn't update list in onMoveEnd, then undo the drag.

    // if (list === state.list) {
    //   return null;
    // }

    let {dragging, lastDrag} = state;

    check: if (lastDrag) {
      const keyFn = DraggableList._getKeyFn<I>(newProps.itemKey);

      let newDragIndex;
      try {
        newDragIndex = DraggableList._getDragIndex<I>(keyFn, list, lastDrag);
      } catch (err) {
        // TODO Explain when we expect this to hit, and make sure there's a test for that.
        dragging = false;
        lastDrag = null;
        break check;
      }

      if (dragging) {
        const currentDragIndex = DraggableList._getDragIndex<I>(keyFn, state.list, lastDrag);
        if (currentDragIndex !== newDragIndex) {
          // Let's change the list so that the new drag index will be the same as
          // the current so that the dragged item doesn't jump on the screen.
          list = update(list, {
            $splice: [[newDragIndex, 1], [currentDragIndex, 0, list[newDragIndex]]]
          });
        }
      }
    }

    return {dragging, lastDrag, list};
  }

  componentWillReceiveProps(newProps: Props<I,C,T>) {
    const update = DraggableList.TODO_getDerivedStateFromProps(newProps, this.state);
    if (update !== null) this.setState(update);
  }

  componentWillUnmount() {
    this._handleMouseUp();
  }

  _handleTouchStart(itemKey: string, pressY: ?number, event: Object) {
    event.stopPropagation();
    this._handleStartDrag(itemKey, pressY, event.touches[0].pageY);
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
      const listEl = this._listRef.current;
      if (!listEl) throw new Error('Should not happen');
      if (
        listEl.contains && document.activeElement &&
        listEl.contains(document.activeElement)
      ) {
        document.activeElement.blur();
      }
    }

    const keyFn = this._getKeyFn();

    let newHeights = null;
    if (this.state.heights == null) {
      const _newHeights: {[key: string]: HeightData} = (Object.create(null): any);

      this.state.list.forEach(item => {
        const key = keyFn(item);
        const containerRef = this._itemRefs.map.get(key);
        const refEl = containerRef ? containerRef.getDOMNode().firstElementChild : null;
        const ref = containerRef ? containerRef.getTemplate() : null;
        const natural = (refEl instanceof HTMLElement) ?
          refEl.offsetHeight : DEFAULT_HEIGHT.natural;
        const drag = ref && (typeof (ref: any).getDragHeight === 'function') && (ref: any).getDragHeight() || natural;

        _newHeights[key] = {natural, drag};
      });

      newHeights = _newHeights;
    }

    const itemIndex = this.state.list.map(keyFn).indexOf(itemKey);

    const startY = pressY == null ?
      this._getDistance(0, itemIndex, false) : pressY;

    const containerEl = this._getContainer();
    const containerScroll = !containerEl || containerEl === document.body ?
      0 : containerEl.scrollTop;

    // Need to re-render once before we start dragging so that the `y` values
    // are set using the correct state.heights and then can animate from there.

    const afterHeights = () => {
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
    };

    if (newHeights) {
      this.setState({heights: newHeights}, afterHeights);
    } else {
      afterHeights();
    }
  }

  _handleTouchMove: Function = (e) => {
    e.preventDefault();
    this._handleMouseMove(e.touches[0]);
  };

  _handleMouseMove: Function = ({pageY, clientY}) => {
    const {
      padding,
      autoScrollMaxSpeed,
      autoScrollRegionSize
    } = this.props;
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
      if (distanceFromTop > 0 && distanceFromTop < autoScrollRegionSize) {
        scrollSpeed = -1 * getScrollSpeed(distanceFromTop, autoScrollMaxSpeed, autoScrollRegionSize);
      } else {
        // Get the lowest of the screen bottom and the container bottom.
        const bottom = Math.min(window.innerHeight, containerRect.bottom);
        const distanceFromBottom = bottom-clientY;
        if (distanceFromBottom > 0 && distanceFromBottom < autoScrollRegionSize) {
          scrollSpeed = getScrollSpeed(distanceFromBottom, autoScrollMaxSpeed, autoScrollRegionSize);
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
    let mouseY = pageY - lastDrag.mouseOffset + containerScroll;
    if (this.props.constrainDrag) {
      mouseY = Math.max(mouseY, this._getDistanceDuringDrag(lastDrag, 0));
      mouseY = Math.min(mouseY, this._getDistanceDuringDrag(lastDrag, this.props.list.length - 1));
    }
    const movementFromNatural = mouseY-naturalPosition;
    // 1 down, -1 up, 0 neither
    const direction = movementFromNatural > 0 ? 1 :
      movementFromNatural < 0 ? -1 : 0;
    let newIndex = dragIndex;
    if (direction !== 0) {
      const keyFn = this._getKeyFn();
      let reach = Math.abs(movementFromNatural);
      for (let i=dragIndex+direction; i < list.length && i >= 0; i += direction) {
        const iDragHeight = this._getItemHeight(keyFn(list[i])).drag;
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

  static _getDragIndex<I>(keyFn: (item: I) => string, list: $ReadOnlyArray<I>, lastDrag: Drag): number {
    const {itemKey} = lastDrag;
    for (let i=0, len=list.length; i < len; i++) {
      if (keyFn(list[i]) === itemKey) {
        return i;
      }
    }
    throw new Error('Failed to find drag index');
  }

  _getDragIndex(): number {
    const {list, lastDrag} = this.state;
    if (!lastDrag) {
      throw new Error('No drag happened');
    }
    const keyFn = this._getKeyFn();
    return DraggableList._getDragIndex(keyFn, list, lastDrag);
  }

  _getItemHeight(key: string): HeightData {
    return this.state.heights != null && key in this.state.heights ?
      this.state.heights[key] : DEFAULT_HEIGHT;
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
      const height = this._getItemHeight(keyFn(list[i]));
      distance += (dragging ? height.drag : height.natural) + padding;
    }
    return distance;
  }

  _getDistanceDuringDrag(lastDrag: Drag, index: number): number {
    const keyFn = this._getKeyFn();
    const {list} = this.state;

    let offset = 0;
    if (this._getDragIndex() < lastDrag.startIndex) {
      const dragItemHeight = this._getItemHeight(lastDrag.itemKey);
      const newCenterHeight =
        this._getItemHeight(keyFn(list[lastDrag.startIndex]));
      offset = dragItemHeight.drag - newCenterHeight.drag;
    }
    return lastDrag.startY + offset +
      this._getDistance(lastDrag.startIndex, index, true);
  }

  _getContainer(): ?HTMLElement {
    const {container} = this.props;
    return container ? container() : null;
  }

  static _getKeyFn<I>(itemKey: string|(item: I)=>string): (item: I) => string {
    return typeof itemKey === 'function' ? itemKey : x => (x: any)[itemKey];
  }

  _getKeyFn(): (item: I) => string {
    return DraggableList._getKeyFn<I>(this.props.itemKey);
  }

  render() {
    const {springConfig, container, padding, template, unsetZIndex, commonProps} = this.props;
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
          y: (useAbsolutePositioning ? spring : (x,ignored)=>x)(dragging && lastDrag ?
            this._getDistanceDuringDrag(lastDrag, i)
            : this._getDistance(0, i, false), springConfig)
        };
      const style = {
        anySelected,
        ...selectedStyle
      };
      const makeDragHandleProps = (getY: ()=>?number): Object => ({
        onMouseDown: e => this._handleMouseDown(key, getY(), e),
        onTouchStart: e => this._handleTouchStart(key, getY(), e)
      });
      const height = this._getItemHeight(key);
      return (
        <Motion
          style={style} key={key}
          children={({itemSelected, anySelected, y}) =>
            <MoveContainer
              ref={this._itemRefs.ref(key)}
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
              makeDragHandleProps={makeDragHandleProps}
              commonProps={commonProps}
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
      <div
        style={{position: 'relative'}}
        ref={this._listRef}
      >
        <Motion
          style={{adjustScroll, anySelected}}
          onRest={() => {
            if (!dragging) {
              this.setState({
                heights: null,
                useAbsolutePositioning: false
              });
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
