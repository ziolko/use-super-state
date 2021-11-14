import { StoreFactory, StoreProxy } from "./types";
import StoreState from "./store-state";
import { storeFactory, storeOptions } from "./path-proxy";

export default class StoreRootContext {
  stores = new Map<StoreFactory<unknown>, StoreState<unknown>>();
  getStore = <T extends unknown>(path: StoreProxy<T>) => {
    const factory = path[storeFactory];
    let result = this.stores.get(factory);
    if (!result) {
      result = new StoreState(factory, path[storeOptions]);
      this.stores.set(factory, result);
    }
    return result;
  };
  getValue = <T extends unknown>(path: StoreProxy<T>) => {
    return this.getStore(path).getValue(path);
  };
  setValue = <T extends unknown>(path: StoreProxy<T>, value: T) => {
    this.getStore(path).setValue(path, value);
  };
}