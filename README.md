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

type User = {
  firstName: string;
  lastName: string;
  age: number | null;
};

const usersIndexState = createSuperState(() => ({} as Record<string, boolean | undefined>))
const usersState = createSuperState(() => ({} as Record<string, user | undefined>));

function useUser(userId: string) {
  return useSuperState(usersState[userId]);
}

function useUsersList() {
  const [getIndex] = useComputedState(usersIndexState).lazy;

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
