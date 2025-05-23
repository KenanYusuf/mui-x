import * as React from 'react';
import {
  DataGridPro,
  useGridApiRef,
  GridInitialState,
  GridDataSource,
} from '@mui/x-data-grid-pro';
import Button from '@mui/material/Button';
import { useMockServer } from '@mui/x-data-grid-generator';

type DataSet = 'Commodity' | 'Employee';

const pageSizeOptions = [5, 10, 50];
const dataSetOptions = {
  dataSet: 'Employee' as DataSet,
  rowLength: 1000,
  treeData: { maxDepth: 3, groupingField: 'name', averageChildren: 5 },
};

export default function ServerSideTreeDataGroupExpansion() {
  const apiRef = useGridApiRef();

  const { fetchRows, columns, initialState } = useMockServer(dataSetOptions);

  const dataSource: GridDataSource = React.useMemo(
    () => ({
      getRows: async (params) => {
        const urlParams = new URLSearchParams({
          paginationModel: JSON.stringify(params.paginationModel),
          filterModel: JSON.stringify(params.filterModel),
          sortModel: JSON.stringify(params.sortModel),
          groupKeys: JSON.stringify(params.groupKeys),
        });
        const getRowsResponse = await fetchRows(
          `https://mui.com/x/api/data-grid?${urlParams.toString()}`,
        );
        return {
          rows: getRowsResponse.rows,
          rowCount: getRowsResponse.rowCount,
        };
      },
      getGroupKey: (row) => row[dataSetOptions.treeData.groupingField],
      getChildrenCount: (row) => row.descendantCount,
    }),
    [fetchRows],
  );

  const initialStateWithPagination: GridInitialState = React.useMemo(
    () => ({
      ...initialState,
      pagination: {
        paginationModel: {
          pageSize: 5,
        },
        rowCount: 0,
      },
    }),
    [initialState],
  );

  return (
    <div style={{ width: '100%' }}>
      <Button onClick={() => apiRef.current?.dataSource.cache.clear()}>
        Reset cache
      </Button>
      <div style={{ height: 400 }}>
        <DataGridPro
          columns={columns}
          dataSource={dataSource}
          treeData
          apiRef={apiRef}
          pagination
          pageSizeOptions={pageSizeOptions}
          initialState={initialStateWithPagination}
          showToolbar
          defaultGroupingExpansionDepth={-1}
        />
      </div>
    </div>
  );
}
