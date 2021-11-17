import React from "react";

import { createSuperState, useLazySuperState, useSuperState } from "../src";
import { ComponentProps, fireEvent, render, screen, waitFor } from "./test-utils";

test("Render initial value", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("0"));
  expect(onRender).toBeCalledTimes(1);
});

test("Increase value on click", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("0"));
  fireEvent.click(screen.getByText("increment-live"));
  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("1"));
  expect(onRender).toBeCalledTimes(2);
});

test("Increase value by two on double click", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("0"));

  fireEvent.click(screen.getByText("increment-live"));
  fireEvent.click(screen.getByText("increment-live"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("2"));
  expect(onRender).toHaveBeenCalledTimes(3);
});

test("Updating with the same value does not trigger re-render", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("0"));

  fireEvent.click(screen.getByText("increment-live"));
  fireEvent.click(screen.getByText("increment-live"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("2"));
  expect(onRender).toHaveBeenCalledTimes(3);
});

test("Does not rerender after clicking in 'lazy' mode", async () => {
  const onRenderLive = jest.fn();
  const onRenderLazy = jest.fn();

  render(
    <>
      <LiveComponent onRender={onRenderLive} />
      <LazyComponent onRender={onRenderLazy} />
    </>
  );

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("0"));
  await waitFor(() => expect(screen.getByTestId("value-lazy")).toHaveTextContent("0"));

  fireEvent.click(screen.getByText("increment-lazy"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("1"));
  await waitFor(() => expect(screen.getByTestId("value-lazy")).toHaveTextContent("0"));

  expect(onRenderLive).toHaveBeenCalledTimes(2);
  expect(onRenderLazy).toHaveBeenCalledTimes(1);
});

type Store = {
  nested?: { value: number } []
}

const testStore = createSuperState<Store>(() => ({ value: 0, nested: [{ value: 0 }, { value: 12 }] }));

function LiveComponent({ onRender }: ComponentProps) {
  const [value, setValue, getValue] = useSuperState(testStore.nested?.[0].value).live;
  onRender();

  return (
    <div>
      <div data-testid={`value-live`}>{value}</div>
      <button onClick={() => setValue(getValue()! + 1)}>increment-live</button>
    </div>
  );
}

function LazyComponent({ onRender }: ComponentProps) {
  const [getValue, setValue] = useSuperState(testStore.nested?.[0].value).lazy;
  onRender();

  return (
    <div>
      <div data-testid={`value-lazy`}>{getValue()}</div>
      <button onClick={() => setValue(getValue()! + 1)}>increment-lazy</button>
    </div>
  );
}
