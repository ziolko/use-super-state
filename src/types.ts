export type StoreFactory<T> = () => T;
export type StoreOptions = { name?: string }
export type PathNode = string | symbol;

export type SuperStore = { get<T>(path: StoreProxy<T>): T, set<T>(path: StoreProxy<T>, value: T): void };
export type StoreProxy<T> = [T] extends [object] ? StoreProxyObject<T> : StoreProxyLeaf<T>;
export type StoreProxyObject<T extends object> = { readonly [Property in keyof T]: StoreProxy<T[Property]>; }
export type StoreProxyLeaf<T> = T;

export type FieldSetterOptions = { action?: string };

export type SuperState<Value> = {
  live: [Value, (value: Value, options?: FieldSetterOptions) => void, () => Value | undefined];
  lazy: [() => Value, (value: Value, options?: FieldSetterOptions) => void];
};

export type ReadOnlySuperState<Value> = {
  live: [Value, never, () => Value];
  lazy: [() => Value];
};

export type Subscriber = () => void;

export type SynchronousCallback<T> = (...args: any[]) => T extends Promise<any> ? never : T