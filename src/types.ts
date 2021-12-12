export type SuperStateFactory<T> = () => T;
export type SuperStateOptions = { name?: string }

export type LazySuperState = [<T>(path: SuperStatePath<T>) => T, <T>(path: SuperStatePath<T>, value: T) => void] & {
  get<T>(path: SuperStatePath<T>): T,
  set<T>(path: SuperStatePath<T>, value: T): void;
};

export type SuperStatePath<T> = [T] extends [object] ? SuperStatePathObject<T> : SuperStatePathLeaf<T>;
export type SuperStatePathObject<T extends object> = { readonly [Property in keyof T]: SuperStatePath<T[Property]>; }
export type SuperStatePathLeaf<T> = T;

export type LazyOrLiveSuperState<Value> = {
  live: [Value, (value: Value, options?: SuperStateSetterOptions) => void, () => Value];
  lazy: [() => Value, (value: Value, options?: SuperStateSetterOptions) => void];
};

export type LazyOrLiveReadOnlySuperState<Value> = {
  live: [Value, never, () => Value];
  lazy: [() => Value];
};

export type SuperStateSetterOptions = { action?: string };
export type Subscriber = () => void;
export type PathNode = string | symbol;
export type SynchronousCallback<T> = (...args: any[]) => T extends Promise<any> ? never : T
