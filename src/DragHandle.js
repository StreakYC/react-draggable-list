/* @flow */

import React from 'react';
import {findDOMNode} from 'react-dom';
import PropTypes from 'prop-types';

export default class DragHandle extends React.Component {
  static propTypes = {
    onMouseDown: PropTypes.func.isRequired,
    onTouchStart: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired
  };

  componentDidMount() {
    const node = findDOMNode(this);
    if (!node) throw new Error('DragHandle missing element');
    node.addEventListener('mousedown', this._onMouseDown);
    node.addEventListener('touchstart', this._onTouchStart);
  }

  componentWillUnmount() {
    const node = findDOMNode(this);
    if (!node) throw new Error('DragHandle missing element');
    node.removeEventListener('mousedown', this._onMouseDown);
    node.removeEventListener('touchstart', this._onTouchStart);
  }

  _onMouseDown: Function = (e) => {
    this.props.onMouseDown.call(null, e);
  };

  _onTouchStart: Function = (e) => {
    this.props.onTouchStart.call(null, e);
  };

  render() {
    return React.Children.only(this.props.children);
  }
}
