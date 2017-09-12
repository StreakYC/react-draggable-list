/* @flow */

import React from 'react';

type Props = {
  cb: Function;
};
export default class OnUpdate extends React.Component<Props> {
  componentDidUpdate() {
    this.props.cb();
  }

  render(): any {
    return null;
  }
}
