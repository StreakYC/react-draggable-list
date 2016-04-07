/* @flow */

import React, {PropTypes} from 'react';

export default class OnUpdate extends React.Component {
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
