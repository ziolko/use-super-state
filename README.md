# useSuperStore 🌟

The React state management library we all deserve. 

## Why?

No new state management library appeared today 😲 I had no choice, but create one to save the day. 

## But seriously, why?

I see the React community trapped into the Redux-like approach to state management. 
It's decent but as a community we need to experiment with new approaches to avoid being stuck in the 
[local optimum](https://en.wikipedia.org/wiki/Local_optimum) breaking a few rules on the way.

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

## Usage 

1. It needs to be easy to create a shared stet

2. Computed state as a 

3. Small API surface - should take no more than 10 minutes to grasp all the ideas
4. Performance - minimizes  
5. 


## License

MIT
