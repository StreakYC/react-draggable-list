/* @flow */

import React, {PropTypes} from 'react';
import TemplateContainer from './TemplateContainer';

type Props = {
  item: Object;
  template: Function;
  padding: number;
  y: ?number;
  itemSelected: number;
  anySelected: number;
  height: Object;
  zIndex: number;
  makeDragHandle: Function;
};
export default class MoveContainer extends React.Component {
  props: Props;
  static propTypes = {
    item: PropTypes.object.isRequired,
    template: PropTypes.func.isRequired,
    padding: PropTypes.number.isRequired,
    y: PropTypes.number,
    itemSelected: PropTypes.number.isRequired,
    anySelected: PropTypes.number.isRequired,
    height: PropTypes.object.isRequired,
    zIndex: PropTypes.number.isRequired,
    makeDragHandle: PropTypes.func.isRequired
  };

  getTemplate(): React.Element {
    return this.refs.templateContainer.getTemplate();
  }

  shouldComponentUpdate(prevProps: Props): boolean {
    return this.props.anySelected !== prevProps.anySelected ||
      this.props.itemSelected !== prevProps.itemSelected ||
      this.props.item !== prevProps.item ||
      this.props.template !== prevProps.template ||
      this.props.y !== prevProps.y ||
      this.props.height !== prevProps.height ||
      this.props.zIndex !== prevProps.zIndex;
  }

  _dragHandle: Function = (el) => this.props.makeDragHandle(el, this.props.y);

  render() {
    const {
      item, y, padding, itemSelected, anySelected, height, zIndex,
      makeDragHandle, template
    } = this.props;

    return (
      <div
        style={{
          position: y == null ? 'relative' : 'absolute',
          boxSizing: 'border-box',
          left: '0',
          right: '0',
          top: y == null ? '0' : `${y}px`,
          marginBottom: `${padding}px`,
          height: y == null ? 'auto' :
            `${anySelected*(height.drag-height.natural)+height.natural}px`,
          zIndex
        }}
        >
        <TemplateContainer
          ref="templateContainer"
          item={item}
          template={template}
          itemSelected={itemSelected}
          anySelected={anySelected}
          dragHandle={this._dragHandle}
          />
      </div>
    );
  }
}
