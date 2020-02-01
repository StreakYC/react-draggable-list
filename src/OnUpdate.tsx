import * as React from 'react';

interface Props {
  cb: () => void;
}

export default class OnUpdate extends React.Component<Props> {
  public componentDidUpdate() {
    this.props.cb();
  }

  public render() {
    return null;
  }
}
