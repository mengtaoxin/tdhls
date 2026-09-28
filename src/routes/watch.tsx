import { createFileRoute } from '@tanstack/react-router';

import { WatchPage } from '@/components/WatchPage';

type WatchSearch = { url: string };

export const Route = createFileRoute('/watch')({
  validateSearch: (search: Record<string, unknown>): WatchSearch => ({
    url: typeof search.url === 'string' ? search.url : '',
  }),
  component: WatchRoute,
});

function WatchRoute() {
  const { url } = Route.useSearch();
  return <WatchPage url={url} />;
}
