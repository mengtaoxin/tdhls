import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  type AnyRouter,
} from '@tanstack/react-router';

import { muiTheme } from '@/theme/muiTheme';

const STUB_PATHS = ['/about', '/watch'] as const;

type ProvidersProps = {
  children: ReactNode;
  withCssBaseline?: boolean;
};

export function TestProviders({ children, withCssBaseline = true }: ProvidersProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      {withCssBaseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { withCssBaseline?: boolean },
) {
  const { withCssBaseline = true, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders withCssBaseline={withCssBaseline}>{children}</TestProviders>
    ),
    ...renderOptions,
  });
}

export type TestRouterOptions = {
  /** UI rendered for the matched index route. */
  component: () => ReactNode;
  /** Optional layout route that must render `<Outlet />`; defaults to providers only. */
  rootComponent?: () => ReactNode;
  initialEntries?: string[];
  extraPaths?: string[];
};

/** Minimal TanStack memory router for components that use Link / useNavigate. */
export function createTestRouter(options: TestRouterOptions): AnyRouter {
  const { component: Page, rootComponent, initialEntries = ['/'], extraPaths = [] } = options;

  const rootRoute = createRootRoute({
    component:
      rootComponent ??
      (() => (
        <TestProviders>
          <Page />
        </TestProviders>
      )),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: rootComponent ? Page : () => null,
  });

  const stubs = [...new Set([...STUB_PATHS, ...extraPaths])].map((path) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path,
      component: () => null,
    }),
  );

  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, ...stubs]),
    history: createMemoryHistory({ initialEntries }),
  });
}

export async function renderWithTestRouter(options: TestRouterOptions) {
  const router = createTestRouter(options);
  await router.load();
  const result = render(<RouterProvider router={router} />);
  return { ...result, router };
}
