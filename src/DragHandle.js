/* @flow */
/* eslint react/prop-types: "error" */

import * as React from 'react';
import PropTypes from 'prop-types';

type Props = {
  onMouseDown: Function;
  onTouchStart: Function;
  children: React.Element<any>;
};
export default class DragHandle extends React.Component<Props> {
  static propTypes = {
    onMouseDown: PropTypes.func.isRequired,
    onTouchStart: PropTypes.func.isRequired,
    children: PropTypes.element.isRequired
  };

  _onMouseDown = (e: MouseEvent) => {
    if (this.props.children.props.onMouseDown) {
      this.props.children.props.onMouseDown(e);
    }
    if (!e.defaultPrevented) {
      this.props.onMouseDown.call(null, e);
    }
  };

  _onTouchStart = (e: MouseEvent) => {
    if (this.props.children.props.onTouchStart) {
      this.props.children.props.onTouchStart(e);
    }
    if (!e.defaultPrevented) {
      this.props.onTouchStart.call(null, e);
    }
  };

  render() {
    return React.cloneElement(
      this.props.children,
      {
        onMouseDown: this._onMouseDown,
        onTouchStart: this._onTouchStart
      }
    );
  }
}
