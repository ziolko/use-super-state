import React, { useCallback } from "react";

import { createSuperStore, useSuperComputed, useSuperState } from "../src";
import { fireEvent, render, screen, waitFor } from "./test-utils";

test("Should compute shared selector only once", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<ParentComponent onRender={onRender} onSelector={onSelector} />);

  await waitFor(() => expect(screen.getByTestId("value-parent")).toHaveTextContent("computed: 0"));
  await waitFor(() => expect(screen.getByTestId("value-child-1")).toHaveTextContent("computed: 0"));
  await waitFor(() => expect(screen.getByTestId("value-child-2")).toHaveTextContent("computed: 0"));

  expect(onSelector).toBeCalledTimes(1);
  expect(onRender).toBeCalledTimes(1);
});

test("Should recompute shared selector only once after dependency change", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<ParentComponent onRender={onRender} onSelector={onSelector} />);
  await waitFor(() => expect(screen.getByTestId("value-parent")).toHaveTextContent("computed: 0"));

  fireEvent.click(screen.getByRole("button", { name: "increment" }));

  await waitFor(() => expect(screen.getByTestId("value-parent")).toHaveTextContent("computed: 1"));
  await waitFor(() => expect(screen.getByTestId("value-child-1")).toHaveTextContent("computed: 1"));
  await waitFor(() => expect(screen.getByTestId("value-child-2")).toHaveTextContent("computed: 1"));

  expect(onSelector).toBeCalledTimes(2);
  expect(onRender).toBeCalledTimes(2);
});



const testStore = createSuperStore(() => ({ value: 0 }));
type TestComponentProps = { onRender: () => void, onSelector?: () => void };

function ParentComponent({ onRender, onSelector }: TestComponentProps) {
  const [getValue, setValue] = useSuperState(testStore.value).lazy;
  const selector = useCallback(() => {
    onSelector?.();
    return `computed: ${getValue()}`;
  }, [getValue, onSelector]);

  const [computed] = useSuperComputed(selector).live;

  onRender();

  return (
    <div>
      <div data-testid={`value-parent`}>{computed}</div>
      <button onClick={() => setValue(getValue() + 1)}>increment</button>
      <ChildComponent id={1} selector={selector} />
      <ChildComponent id={2} selector={selector} />
    </div>
  );
}

function ChildComponent(props: { id: number, selector: () => string }) {
  const [computed] = useSuperComputed(props.selector).live;
  return <div data-testid={`value-child-${props.id}`}>{computed}</div>;
}