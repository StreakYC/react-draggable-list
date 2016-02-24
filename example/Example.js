/* @flow */

import React from 'react';
import DraggableList from '../src';

class PlanetItem extends React.Component {
  render() {
    const {item, itemSelected, anySelected, dragHandle} = this.props;
    const scale = itemSelected * 0.1 + 1;
    const shadow = itemSelected * 15 + 1;

    return (
      <div
        className="item"
        style={{
          transform: `scale(${scale})`,
          boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
        }}>
        {dragHandle(<span className="dragHandle">:: </span>)}
        <span>{ item.name }</span>
        <div>some description here<br/>wow</div>
      </div>
    );
  }
}

export default class Example extends React.Component {
  state: Object = {
    list: [
      {name: 'mercury'},
      {name: 'venus'},
      {name: 'earth'},
      {name: 'mars'},
      {name: 'jupiter'},
      {name: 'saturn'},
      {name: 'uranus'},
      {name: 'neptune'}
    ]
  };

  _toggleExtra: ()=>void = () => {
    const noPluto = this.state.list.filter(item => item.name !== 'pluto');
    if (noPluto.length !== this.state.list.length) {
      this.setState({list: noPluto});
    } else {
      this.setState({list: this.state.list.concat([{name: 'pluto'}])});
    }
  };

  _onListChange: Function = (...args) => {
    console.log('onListChange', args);
  };

  render() {
    return (
      <div className="list">
        foo
        <div>
          <input type="button" value="Toggle" onClick={this._toggleExtra} />
        </div>
        <DraggableList
          itemKey="name"
          template={PlanetItem}
          list={this.state.list}
          onMoveEnd={this._onListChange}
          />
      </div>
    );
  }
}
