/* @flow */

import React from 'react';

type Props<I,C> = {
  item: I;
  template: Function;
  itemSelected: number;
  anySelected: number;
  dragHandle: Function;
  commonProps: C;
};
export default class TemplateContainer<I,C> extends React.Component<Props<I,C>> {
  _template: React.Component<any,any>;
  _templateSetter = (cmp: *) => {
    if (cmp) this._template = cmp;
  };

  shouldComponentUpdate(nextProps: Props<I,C>): boolean {
    return this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.template !== nextProps.template ||
      this.props.commonProps !== nextProps.commonProps;
  }

  getTemplate(): React.Component<any,any> {
    return this._template;
  }

  render() {
    const {item, itemSelected, anySelected, dragHandle, commonProps} = this.props;
    const Template = this.props.template;

    return (
      <Template
        ref={this._templateSetter}
        item={item}
        itemSelected={itemSelected}
        anySelected={anySelected}
        dragHandle={dragHandle}
        commonProps={commonProps}
      />
    );
  }
}
