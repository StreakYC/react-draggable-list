/* @flow */

import React from 'react';
import cx from 'classnames';
import DraggableList from '../src';

class PlanetItem extends React.Component {
  getDragHeight() {
    return this.props.item.subtitle ? 47 : 28;
  }

  render() {
    const {item, itemSelected, anySelected, dragHandle} = this.props;
    const scale = itemSelected * 0.05 + 1;
    const shadow = itemSelected * 15 + 1;
    const dragged = itemSelected !== 0;

    return (
      <div
        className={cx('item', {dragged})}
        style={{
          transform: `scale(${scale})`,
          boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
        }}>
        {dragHandle(<div className="dragHandle" />)}
        <h2>{ item.name }</h2>
        {item.subtitle &&
          <div className="subtitle">This item has a subtitle visible while dragging</div>
        }
        <div>
          some description here<br/>
          this planet orbits the sun<br/>
          this planet is mostly round
        </div>
        {item.subtitle &&
          <div>
            subtitled planets are better<br/>
            and have longer descriptions
          </div>
        }
      </div>
    );
  }
}

export default class Example extends React.Component {
  state: Object = {
    list: [
      {name: 'Mercury'},
      {name: 'Venus'},
      {name: 'Earth', subtitle: true},
      {name: 'Mars'},
      {name: 'Jupiter'},
      {name: 'Saturn', subtitle: true},
      {name: 'Uranus', subtitle: true},
      {name: 'Neptune'}
    ]
  };

  _toggleExtra: ()=>void = () => {
    const noPluto = this.state.list.filter(item => item.name !== 'pluto');
    if (noPluto.length !== this.state.list.length) {
      this.setState({list: noPluto});
    } else {
      this.setState({list: this.state.list.concat([{name: 'Pluto'}])});
    }
  };

  _onListChange: Function = (newList: Array<Object>) => {
    this.setState({list: newList});
  };

  render() {
    return (
      <div className="main">
        <div className="intro">
          <p>
            This is a demonstration of the <a href="https://github.com/StreakYC/react-draggable-list">react-draggable-list</a> library.
          </p>
          <p>
            Each item has a drag handle visible when the user hovers over them.
            The items may have any height, and can each define their own height
            to use while being dragged.
          </p>
          <p>
            When the list is reordered, the page will
            be scrolled if possible to keep the moved item visible and on the
            same part of the screen.
          </p>
        </div>
        <div>
          <input type="button" value="Toggle Pluto" onClick={this._toggleExtra} />
        </div>
        <div className="list">
          <DraggableList
            itemKey="name"
            template={PlanetItem}
            list={this.state.list}
            onMoveEnd={this._onListChange}
            container={()=>document.body}
            />
        </div>
      </div>
    );
  }
}
