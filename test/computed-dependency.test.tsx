import React from "react";

import { createSuperStore, useSuperComputed, useSuperState } from "../src";
import { fireEvent, render, screen, waitFor } from "./test-utils";

test("Should re-use computed value if is a dependency of another computed value", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<TestComponent onRender={onRender} onSelector={onSelector} />);

  await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("0 0 true"));

  expect(onSelector).toBeCalledTimes(1);
  expect(onRender).toBeCalledTimes(1);
});

test("Should recompute value dependant on another computed value", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<TestComponent onRender={onRender} onSelector={onSelector} />);

  await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("0 0 true"));

  fireEvent.click(screen.getByRole("button", { name: "increment" }));
  await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("1 1 true"));

  expect(onSelector).toBeCalledTimes(2);
  expect(onRender).toBeCalledTimes(2);
});

const testStore = createSuperStore(() => ({ value: 0 }));
type TestComponentProps = { onRender: () => void, onSelector?: () => void };

function TestComponent({ onRender, onSelector }: TestComponentProps) {
  const [getValue, setValue] = useSuperState(testStore.value).lazy;

  const [computed, , getComputed] = useSuperComputed(() => {
    onSelector?.();
    return { result: getValue() };
  }, [onSelector, getValue]).live;

  const [dependantComputed] = useSuperComputed(() => getComputed(), [getComputed]).live;

  onRender();

  return (
    <div>
      <div data-testid={`value`}>{computed.result} {dependantComputed.result} {computed === dependantComputed ? "true" : "false"}</div>
      <button onClick={() => setValue(getValue() + 1)}>increment</button>
    </div>
  );
}
