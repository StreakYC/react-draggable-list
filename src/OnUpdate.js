/* @flow */

import {Component, PropTypes} from 'react';

export default class OnUpdate extends Component {
  static propTypes = {
    cb: PropTypes.func.isRequired
  };

  componentDidUpdate() {
    this.props.cb();
  }

  render(): any {
    return null;
  }
}
