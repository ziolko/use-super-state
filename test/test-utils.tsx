import { render } from "@testing-library/react";
import { SuperStoreProvider } from "../src";
import "@testing-library/jest-dom";

const customRender = (ui, options = {}) => render(ui, { wrapper: SuperStoreProvider, ...options });

export * from "@testing-library/react";
export { customRender as render };

export type ComponentProps = { onRender: () => void };
