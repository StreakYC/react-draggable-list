/* @flow */

import React from 'react';
import type {Element as ReactElement} from 'react';
import {findDOMNode} from 'react-dom';

type Props = {
  onMouseDown: Function;
  onTouchStart: Function;
  children: ReactElement<any>;
};
export default class DragHandle extends React.Component<Props> {
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
    // TODO In next major version remove the need for findDOMNode by using React.cloneElement here.
    // Update documentation to require that the element given to dragHandle is either
    // a native DOM element or forwards its props to one.
    return React.Children.only(this.props.children);
  }
}
