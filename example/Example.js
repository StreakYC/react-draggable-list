/* @flow */

import React from 'react';
import cx from 'classnames';
import DraggableList from '../src';

class PlanetItem extends React.Component {
  state: Object = {
    value: 0
  };

  _inc: ()=>void = () => {
    this.setState({
      value: this.state.value+1
    });
  };

  getDragHeight() {
    return this.props.item.subtitle ? 47 : 28;
  }

  render() {
    const {item, itemSelected, anySelected, dragHandle} = this.props;
    const {value} = this.state;
    const scale = itemSelected * 0.05 + 1;
    const shadow = itemSelected * 15 + 1;
    const dragged = itemSelected !== 0;

    return (
      <div
        className={cx('item', {dragged})}
        style={{
          transform: `scale(${scale})`,
          boxShadow: `rgba(0, 0, 0, 0.3) 0px ${shadow}px ${2 * shadow}px 0px`,
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
        <div>
          State works and is retained during movement:
          {' '}<input type="button" value={value} onClick={this._inc} />
        </div>
      </div>
    );
  }
}

export default class Example extends React.Component {
  state: Object = {
    useContainer: false,
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

  _togglePluto: ()=>void = () => {
    const noPluto = this.state.list.filter(item => item.name !== 'Pluto');
    if (noPluto.length !== this.state.list.length) {
      this.setState({list: noPluto});
    } else {
      this.setState({list: this.state.list.concat([{name: 'Pluto'}])});
    }
  };

  _toggleContainer: ()=>void = () => {
    this.setState({useContainer: !this.state.useContainer});
  };

  _onListChange: Function = (newList: Array<Object>) => {
    this.setState({list: newList});
  };

  render() {
    const {useContainer} = this.state;

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
          <div>
            <input type="button" value="Toggle Pluto" onClick={this._togglePluto} />
            <input type="button" value="Toggle Container" onClick={this._toggleContainer} />
          </div>
        </div>
        <div
          className="list" ref="container"
          style={{
            overflow: useContainer ? 'auto' : '',
            height: useContainer ? '200px' : '',
            border: useContainer ? '1px solid gray' : ''
          }}
          >
          <DraggableList
            itemKey="name"
            template={PlanetItem}
            list={this.state.list}
            onMoveEnd={this._onListChange}
            container={()=>useContainer ? this.refs.container : document.body}
            />
        </div>
      </div>
    );
  }
}