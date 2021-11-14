import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react";
import ReactDOM from "react-dom";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { ReadOnlySuperState, StoreProxy, Subscriber, SuperState, SuperStore, SynchronousCallback } from "./types";
import ComputedState from "./computed-state";
import StoreRootContext from "./store-root-context";
import { createPathProxy, storePathHash } from "./path-proxy";

export function SuperStoreProvider({ children }: PropsWithChildren<{}>) {
  const value = useMemo(() => new StoreRootContext(), []);
  return <storeRootContext.Provider value={value} children={children} />;
}

export function createSuperStore<T extends object>(factory: () => T, options?: { name?: string }): StoreProxy<T> {
  return createPathProxy(factory, options ?? {});
}

export function useSuperStore(): SuperStore {
  const rootContext = useContext(storeRootContext);
  if (!rootContext) {
    throw  new Error("Not in context of the SuperStoreProvider");
  }

  return useMemo(() => ({ get: rootContext.getValue, set: rootContext.setValue }), [rootContext]);
}

export function useSuperState<T>(path: StoreProxy<T>): SuperState<T> {
  const rootContext = useContext(storeRootContext);

  if (!rootContext) {
    throw  new Error("Not in context of the SuperStoreProvider");
  }

  const pathHash = path[storePathHash];
  const storeObj = rootContext.getStore(path);

  // When any item of the [storeObj, pathHash] pair changes we should return new callbacks
  const getValue = useCallback(() => storeObj.getValue(path), [storeObj, pathHash]);
  const setValue = useCallback((value: unknown) => storeObj.setValue(path, value), [storeObj, pathHash]);

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

export function useSuperComputed<V, S = undefined>(getter: () => V, dependencies?: unknown[], memoizedSetter?: S): S extends undefined ? ReadOnlySuperState<V> : SuperState<V> {
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

function errorSetter() {
  throw new Error("No setter has been defined for the computed field");
}

export function superAction<T>(execute: SynchronousCallback<T>) {
  dependencyTracking.batchedUpdates = new Set<() => void>();
  ReactDOM.unstable_batchedUpdates(execute);
  dependencyTracking.batchedUpdates.forEach(cb => cb());
  dependencyTracking.batchedUpdates = null;
}

// Internal details
const storeRootContext = createContext<StoreRootContext | null>(null);

export const dependencyTracking: {
  addDependency: ((subscribe: (subscriber: Subscriber) => () => void) => void) | null,
  batchedUpdates: (Set<() => void>) | null
} = {
  addDependency: null,
  batchedUpdates: null
};