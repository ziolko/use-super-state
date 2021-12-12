import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react";
import ReactDOM from "react-dom";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import {
  LazySuperState,
  LazyOrLiveReadOnlySuperState,
  Subscriber,
  LazyOrLiveSuperState,
  SuperStatePath,
  SynchronousCallback
} from "./types";
import ComputedState from "./computed-state";
import SuperStateRootContext, { dependencyTracking } from "./store-root-context";
import { createPathProxy, storePathHash } from "./path-proxy";

export function SuperStateProvider({ children }: PropsWithChildren<{}>) {
  const value = useMemo(() => new SuperStateRootContext(), []);
  return <superStateRootContext.Provider value={value} children={children} />;
}

export function createSuperState<T extends object>(factory: () => T, options?: { name?: string }): SuperStatePath<T> {
  return createPathProxy(factory, options ?? {});
}

export function useSuperState<T>(path: SuperStatePath<T>): LazyOrLiveSuperState<T> {
  const rootContext = useContext(superStateRootContext);

  if (!rootContext) {
    throw  new Error("Not in context of the SuperStoreProvider");
  }

  const pathHash = path[storePathHash];
  const storeObj = rootContext.getStore(path);

  // When any item of the [storeObj, pathHash] pair changes we should return new callbacks
  const getValue = useCallback(() => storeObj.getValue(path), [storeObj, pathHash]);
  const setValue = useCallback((value: unknown) => storeObj.setValue(path as any, value), [storeObj, pathHash]);

  const result = {};
  Object.defineProperties(result, {
    live: {
      enumerable: false,
      get() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const subscribe = useCallback(
          (callback: Subscriber) => storeObj.subscribe(path, callback),
          [storeObj, pathHash]
        );
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const value = useSyncExternalStore(subscribe, getValue);
        return [value, setValue, getValue];
      }
    },
    lazy: { enumerable: false, get: () => [getValue, setValue] }
  });

  return result as any;
}

export function useComputedSuperState<V>(getter: () => V, dependencies?: unknown[]): LazyOrLiveReadOnlySuperState<V>;
export function useComputedSuperState<V>(getter: () => V, dependencies: unknown[], memoizedSetter: (value: V) => void): LazyOrLiveSuperState<V>;

export function useComputedSuperState<V>(getter: () => V, dependencies?: unknown[], memoizedSetter?: (value: V) => void): any {
  const memoizedGetter = useCallback(getter, dependencies as any);
  const result = {};

  Object.defineProperties(result, {
    live: {
      enumerable: false,
      get: function() {
        const state = ComputedState.get(memoizedGetter);
        const value = useSyncExternalStore(state.subscribe, state.getValue);
        return [value, memoizedSetter ?? errorSetter, state.getValue];
      }
    },
    lazy: {
      enumerable: false, get() {
        const state = ComputedState.get(memoizedGetter);
        return [state.getValue, memoizedSetter ?? errorSetter];
      }
    }
  });

  return result as any;
}

export function useLazySuperState(): LazySuperState {
  const rootContext = useContext(superStateRootContext);
  if (!rootContext) {
    throw  new Error("Not in context of the SuperStoreProvider");
  }

  return useMemo(() => {
    const result = ([rootContext.getValue, rootContext.setValue]) as LazySuperState;
    result.get = rootContext.getValue;
    result.set = rootContext.setValue;
    return result;
  }, [rootContext]);
}

export function superAction<T>(execute: SynchronousCallback<T>) {
  dependencyTracking.batchedUpdates = new Set<() => void>();
  ReactDOM.unstable_batchedUpdates(execute);
  dependencyTracking.batchedUpdates.forEach(cb => cb());
  dependencyTracking.batchedUpdates = null;
}

export const superStateRootContext = createContext<SuperStateRootContext | null>(null);

// Internal details
function errorSetter() {
  throw new Error("No setter has been defined for the computed field");
}