'use client';
import { styled } from '@mui/system';
import * as React from 'react';
import { gridDimensionsSelector, useGridEvent, useGridSelector } from '../hooks';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../models/props/DataGridProps';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { GridEventListener } from '../models/events';
import { vars } from '../constants/cssVariables';

interface GridScrollShadowsProps {
  position: 'vertical' | 'horizontal';
}

type OwnerState = Pick<DataGridProcessedProps, 'classes'> & {
  position: 'vertical' | 'horizontal';
};

const ScrollShadow = styled('div')<{ ownerState: OwnerState }>({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  transition: vars.transition(['box-shadow'], {
    duration: vars.transitions.duration.short,
  }),
  variants: [
    {
      props: { position: 'vertical' },
      style: {
        top: 'var(--DataGrid-topContainerHeight)',
        bottom: `calc(var(--DataGrid-bottomContainerHeight) + var(--DataGrid-hasScrollX) * var(--DataGrid-scrollbarSize))`,
        boxShadow: `inset 0 6px 6px -6px rgba(0, 0, 0, calc(var(--hasScrollStart) * 0.2)), inset 0 -6px 6px -6px rgba(0, 0, 0, calc(var(--hasScrollEnd) * 0.2))`,
      },
    },
    {
      props: { position: 'horizontal' },
      style: {
        top: 'var(--DataGrid-headerHeight)',
        left: 'var(--DataGrid-leftPinnedWidth)',
        right: `calc(var(--DataGrid-rightPinnedWidth) + var(--DataGrid-hasScrollY) * var(--DataGrid-scrollbarSize))`,
        boxShadow: `inset 6px 0 6px -6px rgba(0, 0, 0, calc(var(--hasScrollStart) * 0.2)), inset -6px 0 6px -6px rgba(0, 0, 0, calc(var(--hasScrollEnd) * 0.2))`,
      },
    },
  ],
});

function GridScrollShadows(props: GridScrollShadowsProps) {
  const { position } = props;
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes, position };
  const ref = React.useRef<HTMLDivElement>(null);
  const apiRef = useGridApiContext();
  const dimensions = useGridSelector(apiRef, gridDimensionsSelector);
  const initialScrollable = position === 'vertical' ? dimensions.hasScrollY : dimensions.hasScrollX;

  const handleScrolling: GridEventListener<'scrollPositionChange'> = (scrollParams) => {
    const scrollPosition = scrollParams[position === 'vertical' ? 'top' : 'left'];
    const maxScroll =
      dimensions.contentSize[position === 'vertical' ? 'height' : 'width'] -
      dimensions.viewportInnerSize[position === 'vertical' ? 'height' : 'width'];
    ref.current!.style.setProperty('--hasScrollStart', scrollPosition > 0 ? '1' : '0');
    ref.current!.style.setProperty('--hasScrollEnd', scrollPosition < maxScroll ? '1' : '0');
  };

  // TODO: Handle column resizing

  useGridEvent(apiRef, 'scrollPositionChange', handleScrolling);

  return (
    <ScrollShadow
      ownerState={ownerState}
      ref={ref}
      style={
        {
          '--hasScrollStart': 0,
          '--hasScrollEnd': initialScrollable ? '1' : '0',
        } as React.CSSProperties
      }
    />
  );
}

export { GridScrollShadows };
