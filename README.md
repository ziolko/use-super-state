# useSuperStore 🌟

The React state management library made by me for myself.

## Installation

1. Install the npm package with `npm i use-react-state`

2. Render `SuperStateProvider` somewhere near the top of the component tree

```tsx
import { SuperStateProvider } from "use-super-state";

// ...

export default function App() {
  return (
    <SuperStateProvider>
      <Router />
    </SuperStateProvider>
  );
} 
```

3. Add `useComputedSuperState` to the list of `additionalHooks` in ESLint config (recommended).

```json
{
  "eslintConfig": {
    "extends": [
      "react-app"
    ],
    "rules": {
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          "additionalHooks": "(useComputedSuperState)"
        }
      ]
    }
  }
}
```

## API

```tsx

// Create store
const superState = createSuperState(() => ({ counter: 0 }));

// Live selector forces re-render whenever the state changes 
const [counter, setIncrement, getIncrement] = useSuperState(superState.counter).live;

// Lazy selector never forces re-render 
const [getIncrement, setIncrement] = useSuperState(superState.counter).lazy;

// Get or set any field in any store. Useful e.g. in callbacks if they involve many 
// or dynamically determined fields.
const [getValue, setValue] = useLazySuperState();

const counter = getValue(superState.counter);
setValue(superState.counter, 12);

const [getCounter, incrementCounter] = useComputedSuperState(
  () => getValue(counterStore.counter),   // Selector
  [getField],                             // Dependencies of selector (like in useMemo or useCallback)
  increment                               // Memoized version of setter function (not required)
);

function onClick() {
  // Synchronously update a few fields in batch so that it triggers change listeners just once  
  superAction(() => {
    setValue(superState.counter, 15);
    
    // Warning: superState.counter is not yet updated at this point!
    setValue(superState.counter, 20);
  }) 
}
```

## License

MIT
