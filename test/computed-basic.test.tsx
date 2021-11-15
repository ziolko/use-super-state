import React, { useCallback, useEffect } from "react";

import { createSuperState, superAction, useComputedSuperState, useSuperState, useLazySuperState } from "../src";
import { fireEvent, render, screen, waitFor } from "./test-utils";
import { LazySuperState } from "../src/types";

test("Render computed value", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("hello world"));
  expect(onRender).toBeCalledTimes(1);
});

test("Update computed value when any field changes", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("hello world"));
  fireEvent.click(screen.getByText("change-value-1"));
  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("witaj world"));
  expect(onRender).toBeCalledTimes(2);
});

test("Update computed value twice when both fields change separately", async () => {
  const onRender = jest.fn();
  render(<LiveComponent onRender={onRender} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("hello world"));

  fireEvent.click(screen.getByText("change-value-1"));
  fireEvent.click(screen.getByText("change-value-2"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("witaj swiecie"));
  expect(onRender).toBeCalledTimes(3);
});

test("Update computed value once when both fields change sequentially", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<LiveComponent onRender={onRender} onSelector={onSelector} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("hello world"));

  fireEvent.click(screen.getByText("change-both-sequentially"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("ole mundi"));

  expect(onSelector).toBeCalledTimes(3);
  expect(onRender).toBeCalledTimes(2);
});

test("Update computed value once when both fields change in one action", async () => {
  const onRender = jest.fn();
  const onSelector = jest.fn();

  render(<LiveComponent onRender={onRender} onSelector={onSelector} />);

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("hello world"));

  fireEvent.click(screen.getByText("change-both-in-action"));

  await waitFor(() => expect(screen.getByTestId("value-live")).toHaveTextContent("ole mundi"));

  expect(onSelector).toBeCalledTimes(2);
  expect(onRender).toBeCalledTimes(2);
});

test("Should not recompute when selector is no longer used", async () => {
  // TODO
});

const testStore = createSuperState(() => ({ value1: "hello", value2: "world" }));
type TestComponentProps = { onRender: () => void, onSelector?: () => void };

type Card = {
  id: string;
  x: number,
  y: number,
  width: number;
  height: number;
  text: string;
}

function LiveComponent({ onRender, onSelector }: TestComponentProps) {
  const [getValue1, setValue1] = useSuperState(testStore.value1).lazy;
  const [getValue2, setValue2] = useSuperState(testStore.value2).lazy;

  const updateBothInAction = useCallback(() => {
    superAction(() => {
      setValue1("ole");
      setValue2("mundi");
    });
  }, [setValue1, setValue2]);

  const updateBothSequentially = useCallback(() => {
    setValue1("ole");
    setValue2("mundi");
  }, [setValue1, setValue2]);

  const [computed] = useComputedSuperState(() => {
    onSelector?.();
    return `${getValue1()} ${getValue2()}`;
  }, [getValue1, getValue2, onSelector]).live;

  onRender();

  return (
    <div>
      <div data-testid={`value-live`}>{computed}</div>
      <button onClick={() => setValue1("witaj")}>change-value-1</button>
      <button onClick={() => setValue2("swiecie")}>change-value-2</button>
      <button onClick={updateBothSequentially}>change-both-sequentially</button>
      <button onClick={updateBothInAction}>change-both-in-action</button>
    </div>
  );
}

