import { PathNode, StoreOptions } from "./types";

export const storeOptions = Symbol("store options");
export const storeFactory = Symbol("Store factory");
export const storePath = Symbol("store path");
export const storePathHash = Symbol("store path hash");

export function createPathProxy(factory, options: StoreOptions, path: PathNode[] = []) {
  return new Proxy({} as any, {
    get(target, prop: PathNode) {
      switch (prop) {
        case storePath:
          return path;
        case storePathHash:
          return path.join("->");
        case storeOptions:
          return options;
        case storeFactory:
          return factory;
        default:
          return createPathProxy(factory, options, [...path, prop]);
      }
    }
  });
}