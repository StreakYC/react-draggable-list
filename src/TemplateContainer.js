/* @flow */

import React from 'react';

type Props = {
  item: Object;
  template: Function;
  itemSelected: number;
  anySelected: number;
  dragHandle: Function;
  order:number;
  commonProps?: ?Object;
};
export default class TemplateContainer extends React.Component<Props> {
  _template: React.Component<any,any>;
  _templateSetter = (cmp: *) => {
    if (cmp) this._template = cmp;
  };

  shouldComponentUpdate(nextProps: Props): boolean {
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
    const {item, itemSelected, anySelected, dragHandle, order, commonProps} = this.props;
    const Template = this.props.template;

    return (
      <Template
        ref={this._templateSetter}
        item={item}
        order={order}
        itemSelected={itemSelected}
        anySelected={anySelected}
        dragHandle={dragHandle}
        commonProps={commonProps}
      />
    );
  }
}
