import * as React from 'react';
import type { DragHandleProps, ItemRenderer } from '.';

interface Props<I, T> {
  item: I;
  itemRender: ItemRenderer<I, T>;
  itemSelected: number;
  anySelected: number;
  dragHandleProps: DragHandleProps;
}

export default class TemplateContainer<I, T> extends React.Component<
  Props<I, T>
> {
  #template = React.createRef<T>();

  shouldComponentUpdate(nextProps: Props<I, T>): boolean {
    return (
      this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.itemRender !== nextProps.itemRender
    );
  }

  get template() {
    return this.#template.current;
  }

  render() {
    const { item, itemSelected, anySelected, dragHandleProps, itemRender } =
      this.props;

    return itemRender({
      instanceRef: this.#template,
      item,
      itemSelected,
      anySelected,
      dragHandleProps,
    });
  }
}
