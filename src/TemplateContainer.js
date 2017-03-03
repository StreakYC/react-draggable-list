/* @flow */

import React, {PropTypes} from 'react';

type Props = {
  item: Object;
  template: Function;
  itemSelected: number;
  anySelected: number;
  dragHandle: Function;
  additionalProps: Object;
};
export default class TemplateContainer extends React.Component {
  props: Props;
  static propTypes = {
    item: PropTypes.object.isRequired,
    template: PropTypes.func.isRequired,
    itemSelected: PropTypes.number.isRequired,
    anySelected: PropTypes.number.isRequired,
    dragHandle: PropTypes.func.isRequired,
    additionalProps: PropTypes.object
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.template !== nextProps.template;
  }

  getTemplate(): React.Component<any,any,any> {
    return this.refs.template;
  }

  render() {
    const {item, itemSelected, anySelected, dragHandle, additionalProps} = this.props;
    const Template = this.props.template;

    return (
      <Template
        ref="template"
        item={item}
        itemSelected={itemSelected}
        anySelected={anySelected}
        dragHandle={dragHandle}
        additionalProps={additionalProps}
      />
    );
  }
}
