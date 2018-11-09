import * as React from 'react';

export interface TemplateProps<I,C> {
  item: I;
  itemSelected: number;
  anySelected: number;
  dragHandleProps: object;
  commonProps: C;
}

interface Props<I,C,T> {
  itemKey: string|((item: I)=>string);
  template: (new (props: any, context?: any) => T);
  list: ReadonlyArray<I>;
  onMoveEnd?: (newList: ReadonlyArray<I>, movedItem: I, oldIndex: number, newIndex: number) => void;
  container?: () => HTMLElement | null | undefined;
  constrainDrag?: boolean;
  springConfig?: object;
  padding?: number;
  unsetZIndex?: boolean;
  autoScrollMaxSpeed?: number;
  autoScrollRegionSize?: number;
  commonProps?: C;
}

export default class DraggableList<I,C,T extends React.Component<Partial<TemplateProps<I,C>>>> extends React.Component<Props<I,C,T>> {
  getItemInstance(key: string): T;
}
