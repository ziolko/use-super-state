import React from "react";
import "@testing-library/jest-dom";

import { createSuperStore, useSuperState } from "../src";
import { fireEvent, render, screen, waitFor } from "./test-utils";

test("Initializes two stores", async () => {
  render(<TwoStores />);

  await waitFor(() => expect(screen.getByTestId("value-1")).toHaveTextContent("0"));
  await waitFor(() => expect(screen.getByTestId("value-2")).toHaveTextContent("10"));
});

test("Updating first store does not affect second store", async () => {
  render(<TwoStores />);

  await waitFor(() => {
    expect(screen.getByTestId("value-1")).toHaveTextContent("0");
    expect(screen.getByTestId("value-2")).toHaveTextContent("10");
  });

  fireEvent.click(screen.getByText("increment-1"));

  await waitFor(() => {
    expect(screen.getByTestId("value-1")).toHaveTextContent("1");
    expect(screen.getByTestId("value-2")).toHaveTextContent("10");
  });
});

test("Updating second store does not affect first store", async () => {
  render(<TwoStores />);

  await waitFor(() => {
    expect(screen.getByTestId("value-1")).toHaveTextContent("0");
    expect(screen.getByTestId("value-2")).toHaveTextContent("10");
  });

  fireEvent.click(screen.getByText("increment-2"));

  await waitFor(() => {
    expect(screen.getByTestId("value-1")).toHaveTextContent("0");
    expect(screen.getByTestId("value-2")).toHaveTextContent("11");
  });
});

const firstStore = createSuperStore(() => ({ value: 0 }));
const secondStore = createSuperStore(() => ({ value: 10 }));

function TwoStores() {
  const [value1, setValue1, getValue1] = useSuperState(firstStore.value).live;
  const [value2, setValue2, getValue2] = useSuperState(secondStore.value).live;

  return (
    <div>
      <div data-testid={`value-1`}>{value1}</div>
      <button onClick={() => setValue1(getValue1()! + 1)}>increment-1</button>
      <div data-testid={`value-2`}>{value2}</div>
      <button onClick={() => setValue2(getValue2()! + 1)}>increment-2</button>
    </div>
  );
}