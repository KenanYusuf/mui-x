import * as React from 'react';
import { gridVisibleColumnDefinitionsSelector } from '../features/columns/gridColumnsSelector';
import { useGridSelector, useGridSelectorV8 } from './useGridSelector';
import { useGridRootProps } from './useGridRootProps';
import { gridColumnGroupsHeaderMaxDepthSelector } from '../features/columnGrouping/gridColumnGroupsSelector';
import { gridPinnedRowsCountSelector } from '../features/rows/gridRowsSelector';
import { useGridPrivateApiContext } from './useGridPrivateApiContext';
import { isMultipleRowSelectionEnabled } from '../features/rowSelection/utils';
import { gridExpandedRowCountSelector } from '../features/filter/gridFilterSelector';

export const useGridAriaAttributes = (): React.HTMLAttributes<HTMLElement> => {
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const listView = rootProps.unstable_listView;
  const visibleColumns = useGridSelectorV8(apiRef, gridVisibleColumnDefinitionsSelector, listView);
  const accessibleRowCount = useGridSelector(apiRef, gridExpandedRowCountSelector);
  const headerGroupingMaxDepth = useGridSelector(apiRef, gridColumnGroupsHeaderMaxDepthSelector);
  const pinnedRowsCount = useGridSelector(apiRef, gridPinnedRowsCountSelector);

  return {
    role: 'grid',
    'aria-colcount': visibleColumns.length,
    'aria-rowcount': listView
      ? accessibleRowCount
      : headerGroupingMaxDepth + 1 + pinnedRowsCount + accessibleRowCount,
    'aria-multiselectable': isMultipleRowSelectionEnabled(rootProps),
  };
};
