/* @flow */

import React, {PropTypes} from 'react';

type Props = {
  item: Object;
  template: Function;
  itemSelected: number;
  anySelected: number;
  dragHandle: Function;
  commonProps?: ?Object;
};
export default class TemplateContainer extends React.Component {
  props: Props;
  static propTypes = {
    item: PropTypes.object.isRequired,
    template: PropTypes.func.isRequired,
    itemSelected: PropTypes.number.isRequired,
    anySelected: PropTypes.number.isRequired,
    dragHandle: PropTypes.func.isRequired,
    commonProps: PropTypes.object
  };

  _template: React.Component<any,any,any>;
  _templateSetter = (cmp: *) => {
    this._template = cmp;
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.template !== nextProps.template;
  }

  getTemplate(): React.Component<any,any,any> {
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
