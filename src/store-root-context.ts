import { SuperStateFactory, SuperStatePath, Subscriber } from "./types";
import StoreState from "./store-state";
import { storeFactory, storeOptions } from "./path-proxy";

export default class StoreRootContext {
  stores = new Map<SuperStateFactory<unknown>, StoreState<unknown>>();
  getStore = <T extends unknown>(path: SuperStatePath<T>) => {
    const factory = path[storeFactory];
    let result = this.stores.get(factory);
    if (!result) {
      result = new StoreState(factory, path[storeOptions]);
      this.stores.set(factory, result);
    }
    return result;
  };
  getValue = <T extends unknown>(path: SuperStatePath<T>) => {
    return this.getStore(path).getValue(path);
  };
  setValue = <T extends unknown>(path: SuperStatePath<T>, value: T) => {
    this.getStore(path).setValue(path, value);
  };
}

export const dependencyTracking: {
  addDependency: ((subscribe: (subscriber: Subscriber) => () => void) => void) | null,
  batchedUpdates: (Set<() => void>) | null
} = {
  addDependency: null,
  batchedUpdates: null
};