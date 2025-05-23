'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CircularProgress from '@mui/material/CircularProgress';
import unsupportedProp from '@mui/utils/unsupportedProp';
import { alpha } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import MuiCheckbox, { CheckboxProps } from '@mui/material/Checkbox';
import useSlotProps from '@mui/utils/useSlotProps';
import { shouldForwardProp } from '@mui/system/createStyled';
import composeClasses from '@mui/utils/composeClasses';
import { styled, createUseThemeProps } from '../internals/zero-styled';
import { TreeItemProps } from './TreeItem.types';
import { useTreeItem, UseTreeItemLabelSlotOwnProps, UseTreeItemStatus } from '../useTreeItem';
import { getTreeItemUtilityClass, TreeItemClasses } from './treeItemClasses';
import { TreeItemIcon } from '../TreeItemIcon';
import { TreeItemDragAndDropOverlay } from '../TreeItemDragAndDropOverlay';
import { TreeItemProvider } from '../TreeItemProvider';
import { TreeItemLabelInput } from '../TreeItemLabelInput';
import { useTreeViewStyleContext } from '../internals/TreeViewProvider/TreeViewStyleContext';

const useThemeProps = createUseThemeProps('MuiTreeItem');

export const TreeItemRoot = styled('li', {
  name: 'MuiTreeItem',
  slot: 'Root',
})({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  outline: 0,
});

export const TreeItemContent = styled('div', {
  name: 'MuiTreeItem',
  slot: 'Content',
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'status',
})<{ status: UseTreeItemStatus }>(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  paddingLeft: `calc(${theme.spacing(1)} + var(--TreeView-itemChildrenIndentation) * var(--TreeView-itemDepth))`,
  borderRadius: theme.shape.borderRadius,
  width: '100%',
  boxSizing: 'border-box', // prevent width + padding to overflow
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.action.hover,
    // Reset on touch devices, it doesn't add specificity
    '@media (hover: none)': {
      backgroundColor: 'transparent',
    },
  },
  '&[data-disabled]': {
    opacity: (theme.vars || theme).palette.action.disabledOpacity,
    backgroundColor: 'transparent',
  },
  '&[data-focused]': {
    backgroundColor: (theme.vars || theme).palette.action.focus,
  },
  '&[data-selected]': {
    backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
      : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
    '&:hover': {
      backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.hoverOpacity}))`
        : alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
          ),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
          : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
  '&[data-selected][data-focused]': {
    backgroundColor: theme.vars
      ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
      : alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity + theme.palette.action.focusOpacity,
        ),
  },
}));

export const TreeItemLabel = styled('div', {
  name: 'MuiTreeItem',
  slot: 'Label',
  shouldForwardProp: (prop) => shouldForwardProp(prop) && prop !== 'editable',
})<{ editable?: boolean }>(({ theme }) => ({
  width: '100%',
  boxSizing: 'border-box', // prevent width + padding to overflow
  // fixes overflow - see https://github.com/mui/material-ui/issues/27372
  minWidth: 0,
  position: 'relative',
  overflow: 'hidden',
  ...theme.typography.body1,
  variants: [
    {
      props: ({ editable }: UseTreeItemLabelSlotOwnProps) => editable,
      style: {
        paddingLeft: '2px',
      },
    },
  ],
}));

export const TreeItemIconContainer = styled('div', {
  name: 'MuiTreeItem',
  slot: 'IconContainer',
})({
  width: 16,
  display: 'flex',
  flexShrink: 0,
  justifyContent: 'center',
  position: 'relative',
  '& svg': {
    fontSize: 18,
  },
});

export const TreeItemGroupTransition = styled(Collapse, {
  name: 'MuiTreeItem',
  slot: 'GroupTransition',
  overridesResolver: (props, styles) => styles.groupTransition,
})({
  margin: 0,
  padding: 0,
});

export const TreeItemErrorContainer = styled('div', {
  name: 'MuiTreeItem',
  slot: 'ErrorIcon',
})({
  position: 'absolute',
  right: -3,
  width: 7,
  height: 7,
  borderRadius: '50%',
  backgroundColor: 'red',
});

export const TreeItemLoadingContainer = styled(CircularProgress, {
  name: 'MuiTreeItem',
  slot: 'LoadingIcon',
})({
  color: 'text.primary',
});

export const TreeItemCheckbox = styled(
  React.forwardRef(
    (props: CheckboxProps & { visible?: boolean }, ref: React.Ref<HTMLButtonElement>) => {
      const { visible, ...other } = props;
      if (!visible) {
        return null;
      }

      return <MuiCheckbox {...other} ref={ref} />;
    },
  ),
  {
    name: 'MuiTreeItem',
    slot: 'Checkbox',
  },
)({
  padding: 0,
});

const useUtilityClasses = (classesProp: Partial<TreeItemClasses> | undefined) => {
  const { classes: classesFromTreeView } = useTreeViewStyleContext();

  const classes = {
    ...classesProp,
    root: clsx(classesProp?.root, classesFromTreeView.root),
    content: clsx(classesProp?.content, classesFromTreeView.itemContent),
    iconContainer: clsx(classesProp?.iconContainer, classesFromTreeView.itemIconContainer),
    checkbox: clsx(classesProp?.checkbox, classesFromTreeView.itemCheckbox),
    label: clsx(classesProp?.label, classesFromTreeView.itemLabel),
    groupTransition: clsx(classesProp?.groupTransition, classesFromTreeView.itemGroupTransition),
    labelInput: clsx(classesProp?.labelInput, classesFromTreeView.itemLabelInput),
    dragAndDropOverlay: clsx(
      classesProp?.dragAndDropOverlay,
      classesFromTreeView.itemDragAndDropOverlay,
    ),
    errorIcon: clsx(classesProp?.errorIcon, classesFromTreeView.itemErrorIcon),
    loadingIcon: clsx(classesProp?.loadingIcon, classesFromTreeView.itemLoadingIcon),
  };

  const slots = {
    root: ['root'],
    content: ['content'],
    iconContainer: ['iconContainer'],
    checkbox: ['checkbox'],
    label: ['label'],
    groupTransition: ['groupTransition'],
    labelInput: ['labelInput'],
    dragAndDropOverlay: ['dragAndDropOverlay'],
    errorIcon: ['errorIcon'],
    loadingIcon: ['loadingIcon'],
    expanded: ['expanded'],
    editing: ['editing'],
    editable: ['editable'],
    selected: ['selected'],
    focused: ['focused'],
    disabled: ['disabled'],
  };

  return composeClasses(slots, getTreeItemUtilityClass, classes);
};

type TreeItemComponent = ((
  props: TreeItemProps & React.RefAttributes<HTMLLIElement>,
) => React.JSX.Element) & { propTypes?: any };

/**
 *
 * Demos:
 *
 * - [Tree View](https://mui.com/x/react-tree-view/)
 *
 * API:
 *
 * - [TreeItem API](https://mui.com/x/api/tree-view/tree-item-2/)
 */
export const TreeItem = React.forwardRef(function TreeItem(
  inProps: TreeItemProps,
  forwardedRef: React.Ref<HTMLLIElement>,
) {
  const props = useThemeProps({ props: inProps, name: 'MuiTreeItem' });

  const {
    id,
    itemId,
    label,
    disabled,
    children,
    slots = {},
    slotProps = {},
    classes: classesProp,
    ...other
  } = props;

  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getLabelInputProps,
    getDragAndDropOverlayProps,
    getErrorContainerProps,
    getLoadingContainerProps,
    status,
  } = useTreeItem({
    id,
    itemId,
    children,
    label,
    disabled,
  });

  const classes = useUtilityClasses(classesProp);

  const Root: React.ElementType = slots.root ?? TreeItemRoot;
  const rootProps = useSlotProps({
    elementType: Root,
    getSlotProps: getRootProps,
    externalForwardedProps: other,
    externalSlotProps: slotProps.root,
    additionalProps: {
      ref: forwardedRef,
    },
    ownerState: {},
    className: classes.root,
  });

  const Content: React.ElementType = slots.content ?? TreeItemContent;
  const contentProps = useSlotProps({
    elementType: Content,
    getSlotProps: getContentProps,
    externalSlotProps: slotProps.content,
    ownerState: {},
    className: clsx(classes.content, {
      [classes.expanded]: status.expanded,
      [classes.selected]: status.selected,
      [classes.focused]: status.focused,
      [classes.disabled]: status.disabled,
      [classes.editing]: status.editing,
      [classes.editable]: status.editable,
    }),
  });

  const IconContainer: React.ElementType = slots.iconContainer ?? TreeItemIconContainer;
  const iconContainerProps = useSlotProps({
    elementType: IconContainer,
    getSlotProps: getIconContainerProps,
    externalSlotProps: slotProps.iconContainer,
    ownerState: {},
    className: classes.iconContainer,
  });

  const Label: React.ElementType = slots.label ?? TreeItemLabel;
  const labelProps = useSlotProps({
    elementType: Label,
    getSlotProps: getLabelProps,
    externalSlotProps: slotProps.label,
    ownerState: {},
    className: classes.label,
  });

  const Checkbox: React.ElementType = slots.checkbox ?? TreeItemCheckbox;
  const checkboxProps = useSlotProps({
    elementType: Checkbox,
    getSlotProps: getCheckboxProps,
    externalSlotProps: slotProps.checkbox,
    ownerState: {},
    className: classes.checkbox,
  });

  const GroupTransition: React.ElementType | undefined = slots.groupTransition ?? undefined;
  const groupTransitionProps = useSlotProps({
    elementType: GroupTransition,
    getSlotProps: getGroupTransitionProps,
    externalSlotProps: slotProps.groupTransition,
    ownerState: {},
    className: classes.groupTransition,
  });

  const LabelInput: React.ElementType = slots.labelInput ?? TreeItemLabelInput;
  const labelInputProps = useSlotProps({
    elementType: LabelInput,
    getSlotProps: getLabelInputProps,
    externalSlotProps: slotProps.labelInput,
    ownerState: {},
    className: classes.labelInput,
  });

  const DragAndDropOverlay: React.ElementType | undefined =
    slots.dragAndDropOverlay ?? TreeItemDragAndDropOverlay;
  const dragAndDropOverlayProps = useSlotProps({
    elementType: DragAndDropOverlay,
    getSlotProps: getDragAndDropOverlayProps,
    externalSlotProps: slotProps.dragAndDropOverlay,
    ownerState: {},
    className: classes.dragAndDropOverlay,
  });

  const ErrorIcon: React.ElementType = slots.errorIcon ?? TreeItemErrorContainer;
  const errorContainerProps = useSlotProps({
    elementType: ErrorIcon,
    getSlotProps: getErrorContainerProps,
    externalSlotProps: slotProps.errorIcon,
    ownerState: {},
    className: classes.errorIcon,
  });

  const LoadingIcon: React.ElementType = slots.loadingIcon ?? TreeItemLoadingContainer;
  const loadingContainerProps = useSlotProps({
    elementType: LoadingIcon,
    getSlotProps: getLoadingContainerProps,
    externalSlotProps: slotProps.loadingIcon,
    ownerState: {},
    className: classes.loadingIcon,
  });

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <Root {...rootProps}>
        <Content {...contentProps}>
          <IconContainer {...iconContainerProps}>
            {status.error && <ErrorIcon {...errorContainerProps} />}

            {status.loading ? (
              <LoadingIcon {...loadingContainerProps} />
            ) : (
              <TreeItemIcon status={status} slots={slots} slotProps={slotProps} />
            )}
          </IconContainer>
          <Checkbox {...checkboxProps} />
          {status.editing ? <LabelInput {...labelInputProps} /> : <Label {...labelProps} />}
          <DragAndDropOverlay {...dragAndDropOverlayProps} />
        </Content>
        {children && <TreeItemGroupTransition as={GroupTransition} {...groupTransitionProps} />}
      </Root>
    </TreeItemProvider>
  );
}) as TreeItemComponent;

TreeItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The content of the component.
   */
  children: PropTypes /* @typescript-to-proptypes-ignore */.any,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: PropTypes.object,
  className: PropTypes.string,
  /**
   * If `true`, the item is disabled.
   * @default false
   */
  disabled: PropTypes.bool,
  /**
   * The id attribute of the item. If not provided, it will be generated.
   */
  id: PropTypes.string,
  /**
   * The id of the item.
   * Must be unique.
   */
  itemId: PropTypes.string.isRequired,
  /**
   * The label of the item.
   */
  label: PropTypes.node,
  /**
   * Callback fired when the item root is blurred.
   */
  onBlur: PropTypes.func,
  /**
   * This prop isn't supported.
   * Use the `onItemFocus` callback on the tree if you need to monitor an item's focus.
   */
  onFocus: unsupportedProp,
  /**
   * Callback fired when a key is pressed on the keyboard and the tree is in focus.
   */
  onKeyDown: PropTypes.func,
  /**
   * The props used for each component slot.
   * @default {}
   */
  slotProps: PropTypes.object,
  /**
   * Overridable component slots.
   * @default {}
   */
  slots: PropTypes.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;
