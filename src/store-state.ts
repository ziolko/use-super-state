import { PathNode, StoreFactory, StoreOptions, StoreProxy, Subscriber } from "./types";
import ReactDOM from "react-dom";
import { storePath } from "./path-proxy";
import { dependencyTracking } from "./store-root-context";

export default class StoreState<T> {
  factory: StoreFactory<T>;
  options?: StoreOptions;
  value: T;
  rootSubscribers = new Set<Subscriber>();
  subscribersMap = new Map<string | Symbol, Set<Subscriber>>();

  constructor(factory: StoreFactory<T>, options?: StoreOptions) {
    this.factory = factory;
    this.options = options;
    this.value = factory();
  }

  getValue = <V>(pathProxy: StoreProxy<V>) => {
    const path = pathProxy[storePath];
    dependencyTracking.addDependency?.((subscriber) => this.subscribe(pathProxy, subscriber));
    return path.reduce((acc: any, arg: string | symbol) => acc?.[arg], this.value);
  };

  setValue = <V>(pathProxy: StoreProxy<V>, newValue: V) => {
    const path = pathProxy[storePath];

    const oldValue = this.getValue(pathProxy);
    if (oldValue === newValue) {
      return;
    }

    this.value = updateNestedField(this.value, newValue, path, path) as T;

    ReactDOM.unstable_batchedUpdates(() => {
      const callSubscriber = (subscriber) => dependencyTracking.batchedUpdates?.add(subscriber) ?? subscriber();
      if (path.length > 0) {
        this.subscribersMap.get(path[0])?.forEach(callSubscriber);
      }
      this.rootSubscribers?.forEach(callSubscriber);
    });
  };

  subscribe = <V>(pathProxy: StoreProxy<V>, subscriber: Subscriber) => {
    const path = pathProxy[storePath];

    let subscribers = path.length === 0 ? this.rootSubscribers : this.subscribersMap.get(path[0]);
    if (!subscribers) {
      subscribers = new Set<Subscriber>();
      this.subscribersMap.set(path[0], subscribers);
    }
    subscribers.add(subscriber);
    return () => {
      subscribers!.delete(subscriber);
      if (path.length > 0 && subscribers!.size === 0) {
        this.subscribersMap.delete(path[0]);
      }
    };
  };
}

function updateNestedField(currentValue: unknown, newValue: unknown, path: PathNode[], fullPath: PathNode[]): unknown {
  if (path.length === 0) {
    return newValue;
  }

  if (typeof currentValue !== "object") {
    const emptyPath = fullPath.slice(0, fullPath.length - path.length).join(".");

    // prettier-ignore
    throw new Error(
      `Unable to set "${fullPath.join(".")}" in store because "${emptyPath}" is equal "${currentValue}" which is neither an object nor array. Please initialize it before setting nested properties.`
    );
  }

  const [head, ...tail] = path;
  return {
    ...currentValue,
    [head]: updateNestedField(currentValue![head], newValue, tail, fullPath)
  };
}