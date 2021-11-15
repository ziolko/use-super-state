import { Subscriber } from "./types";
import { dependencyTracking } from "./store-root-context";

export default class ComputedState {
  static get(factory: () => unknown) {
    let result = ComputedState.stateMap.get(factory);
    if (!result) {
      result = new ComputedState(factory);
      ComputedState.stateMap.set(factory, result);
    }
    return result;
  }

  private static stateMap = new WeakMap<() => unknown, ComputedState>();

  private constructor(factory: () => unknown) {
    this.factory = factory;
  }

  factory: () => unknown;
  value: unknown = undefined;
  isDirty = true;
  listeners: Set<Subscriber> = new Set();
  unsubscribeFromDependencies: (() => void)[] = [];
  markDirty = () => {
    if (!this.isDirty) {
      this.isDirty = true;
      this.listeners.forEach(listener => listener());
    }
  };
  addDependency = (subscribe: (subscriber: Subscriber) => () => void) => {
    this.unsubscribeFromDependencies.push(subscribe(this.markDirty));
  };
  subscribe = (listener: Subscriber) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        ComputedState.stateMap.delete(this.factory);
      }
    };
  };
  getValue = () => {
    dependencyTracking.addDependency?.(this.subscribe);

    if (this.isDirty) {
      const previousAddDependency = dependencyTracking.addDependency;
      dependencyTracking.addDependency = this.addDependency;
      this.value = this.factory();
      this.isDirty = false;
      dependencyTracking.addDependency = previousAddDependency;
    }

    return this.value;
  };
}
