/* @flow */

import React from 'react';
import TemplateContainer from './TemplateContainer';

type Props = {
  item: Object;
  template: Function;
  padding: number;
  y: ?number;
  itemSelected: number;
  anySelected: number;
  height: Object;
  zIndex: number|string;
  makeDragHandle: Function;
  order: number;
  commonProps?: ?Object;
};
export default class MoveContainer extends React.Component<Props> {
  _templateContainer: TemplateContainer;
  _templateContainerSetter = (cmp: ?TemplateContainer) => {
    if (cmp) this._templateContainer = cmp;
  };

  getTemplate(): React.Component<any,any> {
    return this._templateContainer.getTemplate();
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.template !== nextProps.template ||
      this.props.y !== nextProps.y ||
      this.props.height !== nextProps.height ||
      this.props.zIndex !== nextProps.zIndex ||
      this.props.commonProps !== nextProps.commonProps;
  }

  _dragHandle: Function = (el) => this.props.makeDragHandle(el, ()=>this.props.y);

  render() {
    const {
      item, y, padding, itemSelected, anySelected, height, zIndex, template, commonProps,
      order
    } = this.props;

    return (
      <div
        style={{
          position: y == null ? 'relative' : 'absolute',
          boxSizing: 'border-box',
          left: '0px',
          right: '0px',
          top: y == null ? '0px' : `${y}px`,
          marginBottom: `${padding}px`,
          height: y == null ? 'auto' :
            `${anySelected*(height.drag-height.natural)+height.natural}px`,
          zIndex
        }}
      >
        <TemplateContainer
          ref={this._templateContainerSetter}
          item={item}
          order={order}
          template={template}
          itemSelected={itemSelected}
          anySelected={anySelected}
          dragHandle={this._dragHandle}
          commonProps={commonProps}
        />
      </div>
    );
  }
}
