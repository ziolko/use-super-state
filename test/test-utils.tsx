import { render } from "@testing-library/react";
import { SuperStateProvider } from "../src";
import "@testing-library/jest-dom";

const customRender = (ui, options = {}) => render(ui, { wrapper: SuperStateProvider, ...options });

export * from "@testing-library/react";
export { customRender as render };

export type ComponentProps = { onRender: () => void };
