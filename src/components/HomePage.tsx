import { useNavigate } from '@tanstack/react-router';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { StreamHistoryList } from '@/components/StreamHistoryList';
import { StreamUrlForm } from '@/components/StreamUrlForm';
import { useStreamHistory } from '@/hooks/useStreamHistory';
import { applyUrlFunction } from '@/lib/hls/urlFunction';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { history, add, remove } = useStreamHistory();
  const urlFunction = usePlayerPrefsStore((s) => s.urlFunction);

  const play = (url: string) => {
    add(url);
    const playbackUrl = applyUrlFunction(urlFunction, url);
    void navigate({ to: '/watch', state: { streamUrl: url, playbackUrl } });
  };

  return (
    <Container
      sx={(theme) => ({ maxWidth: theme.layout.pageMaxWidth, pt: theme.layout.pageTopInset })}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        {t('home.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('home.lead')}
      </Typography>
      <StreamUrlForm onPlay={play} />
      <StreamHistoryList history={history} onPlay={play} onRemove={remove} />
    </Container>
  );
}
