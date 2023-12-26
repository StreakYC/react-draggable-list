/* eslint-disable no-console */

import * as React from 'react';
import cx from 'classnames';
import { DragHandleProps, DraggableList, ItemRenderer } from '../src';

interface PlanetListItem {
  name: string;
  subtitle?: boolean;
}

interface PlanetProps {
  item: PlanetListItem;
  itemSelected: number;
  dragHandleProps: DragHandleProps;
}
interface PlanetState {
  value: number;
}
class PlanetItem extends React.Component<PlanetProps, PlanetState> {
  state = {
    value: 0,
  };

  _inc() {
    this.setState({
      value: this.state.value + 1,
    });
  }

  getDragHeight() {
    return this.props.item.subtitle ? 47 : 28;
  }

  render() {
    const { item, itemSelected, dragHandleProps } = this.props;
    const { value } = this.state;
    const scale = itemSelected * 0.05 + 1;
    const shadow = itemSelected * 15 + 1;
    const dragged = itemSelected !== 0;

    return (
      <div
        className={cx('item', { dragged })}
        style={{
          transform: `scale(${scale})`,
          boxShadow: `rgba(0, 0, 0, 0.3) 0px ${shadow}px ${2 * shadow}px 0px`,
        }}
      >
        <div className="dragHandle" {...dragHandleProps} />
        <h2>{item.name}</h2>
        {item.subtitle && (
          <div className="subtitle">
            This item has a subtitle visible while dragging
          </div>
        )}
        <div>
          some description here
          <br />
          this planet orbits the sun
          <br />
          this planet is mostly round
        </div>
        {item.subtitle && (
          <div>
            subtitled planets are better
            <br />
            and have longer descriptions
          </div>
        )}
        <div>
          State works and is retained during movement:{' '}
          <input type="button" value={value} onClick={() => this._inc()} />
        </div>
      </div>
    );
  }
}

type ExampleState = {
  useContainer: boolean;
  list: ReadonlyArray<PlanetListItem>;
};
export default class Example extends React.Component<{}, ExampleState> {
  private _container = React.createRef<HTMLDivElement>();

  state = {
    useContainer: false,
    list: [
      { name: 'Mercury' },
      { name: 'Venus' },
      { name: 'Earth', subtitle: true },
      { name: 'Mars' },
      { name: 'Jupiter' },
      { name: 'Saturn', subtitle: true },
      { name: 'Uranus', subtitle: true },
      { name: 'Neptune' },
    ],
  };

  private _togglePluto() {
    const noPluto = this.state.list.filter((item) => item.name !== 'Pluto');
    if (noPluto.length !== this.state.list.length) {
      this.setState({ list: noPluto });
    } else {
      this.setState({ list: this.state.list.concat([{ name: 'Pluto' }]) });
    }
  }

  private _toggleContainer() {
    this.setState({ useContainer: !this.state.useContainer });
  }

  private _onListChange(newList: ReadonlyArray<PlanetListItem>) {
    this.setState({ list: newList });
  }

  static #renderTemplate: ItemRenderer<PlanetListItem, PlanetItem> = ({
    instanceRef,
    item,
    itemSelected,
    dragHandleProps,
  }) => (
    <PlanetItem
      ref={instanceRef}
      item={item}
      itemSelected={itemSelected}
      dragHandleProps={dragHandleProps}
    />
  );

  render() {
    const { useContainer } = this.state;

    return (
      <div className="main">
        <div className="intro">
          <p>
            This is a demonstration of the{' '}
            <a href="https://github.com/StreakYC/react-draggable-list">
              react-draggable-list
            </a>{' '}
            library.
          </p>
          <p>
            Each item has a drag handle visible when the user hovers over them.
            The items may have any height, and can each define their own height
            to use while being dragged.
          </p>
          <p>
            When the list is reordered, the page will be scrolled if possible to
            keep the moved item visible and on the same part of the screen.
          </p>
          <div>
            <input
              type="button"
              value="Toggle Pluto"
              onClick={() => this._togglePluto()}
            />
            <input
              type="button"
              value="Toggle Container"
              onClick={() => this._toggleContainer()}
            />
          </div>
        </div>
        <div
          className="list"
          ref={this._container}
          style={{
            overflow: useContainer ? 'auto' : '',
            height: useContainer ? '200px' : '',
            border: useContainer ? '1px solid gray' : '',
          }}
        >
          <DraggableList<PlanetListItem, PlanetItem>
            itemKey="name"
            renderItem={Example.#renderTemplate}
            list={this.state.list}
            onItemsChange={(newList) => this._onListChange(newList)}
            container={() =>
              useContainer ? this._container.current! : document.body
            }
          />
        </div>
        <footer>Footer here.</footer>
      </div>
    );
  }
}
