import * as React from 'react';
import TemplateContainer from './TemplateContainer';
import type { DragHandleProps, RenderTemplate } from '.';

export interface HeightData {
  natural: number;
  drag: number;
}

interface Props<I, T> {
  item: I;
  renderTemplate: RenderTemplate<I, T>;
  padding: number;
  y: number | undefined;
  itemSelected: number;
  anySelected: number;
  height: HeightData;
  zIndex: React.CSSProperties['zIndex'];
  makeDragHandleProps: (getY: () => number | undefined) => DragHandleProps;
}

export default class MoveContainer<I, T> extends React.Component<Props<I, T>> {
  private readonly _templateContainer =
    React.createRef<TemplateContainer<I, T>>();
  private readonly _el = React.createRef<HTMLDivElement>();

  getDOMNode(): HTMLElement {
    return this._el.current!;
  }

  get template() {
    return this._templateContainer.current!.template;
  }

  shouldComponentUpdate(nextProps: Props<I, T>): boolean {
    return (
      this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.renderTemplate !== nextProps.renderTemplate ||
      this.props.y !== nextProps.y ||
      this.props.height !== nextProps.height ||
      this.props.zIndex !== nextProps.zIndex
    );
  }

  private _dragHandleProps = this.props.makeDragHandleProps(() => this.props.y);

  render() {
    const {
      item,
      y,
      padding,
      itemSelected,
      anySelected,
      height,
      zIndex,
      renderTemplate,
    } = this.props;

    return (
      <div
        ref={this._el}
        style={{
          position: y == null ? ('relative' as const) : ('absolute' as const),
          boxSizing: 'border-box' as const,
          left: '0px',
          right: '0px',
          top: y == null ? '0px' : `${y}px`,
          marginBottom: `${padding}px`,
          height:
            y == null
              ? 'auto'
              : `${
                  anySelected * (height.drag - height.natural) + height.natural
                }px`,
          zIndex,
        }}
      >
        <TemplateContainer
          ref={this._templateContainer}
          item={item}
          renderTemplate={renderTemplate}
          itemSelected={itemSelected}
          anySelected={anySelected}
          dragHandleProps={this._dragHandleProps}
        />
      </div>
    );
  }
}
