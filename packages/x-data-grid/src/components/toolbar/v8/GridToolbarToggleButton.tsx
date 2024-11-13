import * as React from 'react';
import ToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton';
import { styled } from '@mui/system';
import composeClasses from '@mui/utils/composeClasses';
import clsx from 'clsx';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { getDataGridUtilityClass } from '../../../constants/gridClasses';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';

export type GridToolbarToggleButtonProps = ToggleButtonProps;

type OwnerState = DataGridProcessedProps;

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['toolbarToggleButton'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const StyledToggleButton = styled(ToggleButton, {
  name: 'MuiDataGrid',
  slot: 'ToolbarToggleButton',
  overridesResolver: (_, styles) => styles.toolbarToggleButton,
})<{ ownerState: OwnerState }>(({ theme }) => ({
  border: 0,
  gap: theme.spacing(0.5),
}));

const GridToolbarToggleButton = React.forwardRef<HTMLButtonElement, GridToolbarToggleButtonProps>(
  function GridToolbarToggleButton(props, ref) {
    const { children, className, ...other } = props;
    const rootProps = useGridRootProps();
    const classes = useUtilityClasses(rootProps);

    return (
      <StyledToggleButton
        ref={ref}
        as={rootProps.slots.baseToggleButton}
        ownerState={rootProps}
        className={clsx(classes.root, className)}
        size="small"
        {...rootProps.slotProps?.baseToggleButton}
        {...other}
      >
        {children}
      </StyledToggleButton>
    );
  },
);

export { GridToolbarToggleButton };