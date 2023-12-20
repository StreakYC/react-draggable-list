import * as React from 'react';
import type { DragHandleProps, RenderTemplate } from '.';

interface Props<I, C, T> {
  item: I;
  renderTemplate: RenderTemplate<I, C, T>;
  itemSelected: number;
  anySelected: number;
  dragHandleProps: DragHandleProps;
  commonProps?: C;
}

export default class TemplateContainer<
  I,
  C,
  T extends React.Component<Props<I, C, T>>
> extends React.Component<Props<I, C, T>> {
  #template = React.createRef<T>();

  shouldComponentUpdate(nextProps: Props<I, C, T>): boolean {
    return (
      this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.renderTemplate !== nextProps.renderTemplate ||
      this.props.commonProps !== nextProps.commonProps
    );
  }

  get template() {
    return this.#template;
  }

  render() {
    const {
      item,
      itemSelected,
      anySelected,
      dragHandleProps,
      commonProps,
      renderTemplate,
    } = this.props;

    return renderTemplate({
      instanceRef: this.#template,
      item,
      itemSelected,
      anySelected,
      dragHandleProps,
      commonProps,
    });
  }
}
