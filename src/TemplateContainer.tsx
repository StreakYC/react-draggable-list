import * as React from 'react';

interface Props<I,C,T> {
  item: I;
  template: (new (props: any, context?: any) => T);
  itemSelected: number;
  anySelected: number;
  dragHandleProps: object;
  commonProps: C;
}

export default class TemplateContainer<I,C,T extends React.Component<any,any>> extends React.Component<Props<I,C,T>> {
  private _template: T | undefined;
  private readonly _templateSetter = (cmp: any) => {
    this._template = cmp;
  };

  public shouldComponentUpdate(nextProps: Props<I,C,T>): boolean {
    return this.props.anySelected !== nextProps.anySelected ||
      this.props.itemSelected !== nextProps.itemSelected ||
      this.props.item !== nextProps.item ||
      this.props.template !== nextProps.template ||
      this.props.commonProps !== nextProps.commonProps;
  }

  public getTemplate(): T {
    return this._template!;
  }

  public render() {
    const {item, itemSelected, anySelected, dragHandleProps, commonProps} = this.props;
    const Template = this.props.template;

    return (
      <Template
        ref={this._templateSetter}
        item={item}
        itemSelected={itemSelected}
        anySelected={anySelected}
        dragHandleProps={dragHandleProps}
        commonProps={commonProps}
      />
    );
  }
}
