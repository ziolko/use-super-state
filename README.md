# useSuperStore 🌟

The React state management library we all deserve.

## Why?

No new state management library appeared today 😲 I had no choice, but create one to save the day.

## But seriously, why?

I see the React community trapped into the Redux-like approach to state management. It's decent but as a community we
need to experiment with new approaches to avoid being stuck in the
[local optimum](https://en.wikipedia.org/wiki/Local_optimum).

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

## Example

```tsx
import React from 'react';
import { createSuperState, useSuperState, useComputedSuperState } from "use-super-state";

// useSupportState is written in TypeScript and has full support for it
type User = {
  firstName: string;
  lastName: string;
  age: number | null;
};

// Create stores. They can be created wherever possible e.g. each big functionality 
// can have its own store. I create two stores below for demonstration purposes.
const usersIndexState = createSuperState(() => ({} as Record<string, boolean | undefined>))
const usersState = createSuperState(() => ({} as Record<string, User | undefined>));

// Use this hook whereven in the application code to get user with given ID from the store.
// You can add any data loading logic here in a useEffect.
function useUser(userId: string) {
  // The parameter for useSuperState has similar role to a redux selector. 
  // The object usersState[userId] doesn't isn't a value of this path in store, but 
  // represents a selector of this path.
  return useSuperState(usersState[userId]);
}

// An example of a computed property. It doesn't return value directly from
// the store, but computes it based on one or many paths in the store. 
function useUsersList() {
  // Notice the .lazy part. This means the component using this hook does not rerender
  // every time usersIndexState changes.
  const [getIndex] = useState(usersIndexState).lazy;

  return useComputedSuperState(() => {
    return Object.entries(getIndex()).filter(([userId, value]) => value).map(([userId]) => userId)
  }, [getIndex]);
}

function Users() {
  const [usersIds] = useUsersList().live
  return (
    <>
      {usersIds.map((userId) => <User id={userId} key={userId} />)}
    </>
  );
}

const User = React.memo((props: { id: string }) => {
  const [user, setUser] = useUser(props.id);

  return <div>{user.firstName}</div>
})
```

### API documentation

TODO

## License

MIT
