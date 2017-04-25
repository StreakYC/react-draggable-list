/* @flow */

import React from 'react';
import PropTypes from 'prop-types';

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
