import { lruMemoize, createSelectorCreator, CreateSelectorFunction } from 'reselect';
import { TreeViewAnyPluginSignature, TreeViewState, TreeViewStateCacheKey } from '../models';

const reselectCreateSelector = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {
    maxSize: 1,
    equalityCheck: Object.is,
  },
});

const cache = new WeakMap<
  TreeViewStateCacheKey,
  Map<Parameters<typeof reselectCreateSelector>, any>
>();

/**
 * Type of a selector that take the whole tree view state as input and returns a value based on a required plugin.
 */
export type TreeViewRootSelector<
  TSignature extends TreeViewAnyPluginSignature,
  TIsOptional extends boolean = false,
> = <
  TSignatures extends TIsOptional extends true ? [] : [TSignature],
  TOptionalSignatures extends TIsOptional extends true ? [TSignature] : [],
>(
  state: TreeViewState<TSignatures, TOptionalSignatures>,
) => TIsOptional extends true
  ? TSignature['state'][keyof TSignature['state']] | undefined
  : TSignature['state'][keyof TSignature['state']];

/**
 * Type of a selector that take the whole tree view state as input and returns a value based on an optional plugin.
 */
export type TreeViewRootSelectorForOptionalPlugin<TSignature extends TreeViewAnyPluginSignature> = <
  TSignatures extends [],
  TOptionalSignatures extends [TSignature],
>(
  state: TreeViewState<TSignatures, TOptionalSignatures>,
) => TSignature['state'][keyof TSignature['state']] | undefined;

export type TreeViewSelector<TState, TArgs, TResult> = (state: TState, args: TArgs) => TResult;

/**
 * Method wrapping reselect's createSelector to provide caching for tree view instances.
 *
 */
export const createSelector = ((...createSelectorArgs: any) => {
  const selector: TreeViewSelector<TreeViewState<any>, any, any> = (state, selectorArgs) => {
    const cacheKey = state.cacheKey;

    // If there is no cache for the current tree view instance, create one.
    let cacheForCurrentTreeViewInstance = cache.get(cacheKey);
    if (!cacheForCurrentTreeViewInstance) {
      cacheForCurrentTreeViewInstance = new Map();
      cache.set(cacheKey, cacheForCurrentTreeViewInstance);
    }

    // If there is a cached selector, execute it.
    const cachedSelector = cacheForCurrentTreeViewInstance.get(createSelectorArgs);
    if (cachedSelector) {
      return cachedSelector(state, selectorArgs);
    }

    // Otherwise, create a new selector and cache it and execute it.
    const fn = reselectCreateSelector(...createSelectorArgs);
    cacheForCurrentTreeViewInstance.set(createSelectorArgs, fn);

    return fn(state, selectorArgs);
  };

  return selector;
}) as unknown as CreateSelectorFunction;
