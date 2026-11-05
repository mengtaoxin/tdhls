import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

import { VideoPlayer } from '@/components/VideoPlayer';
import { parseStreamUrl } from '@/lib/hls/streamUrl';

export function WatchPage({ url, playbackUrl }: { url: string; playbackUrl?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const playbackNonce = useLocation({ select: (location) => location.state.playbackNonce });
  const nonce = typeof playbackNonce === 'number' ? playbackNonce : 0;
  const streamUrl = parseStreamUrl(url);
  // Fallback keeps direct renders / older history state working.
  const playUrl = streamUrl ? (playbackUrl ?? streamUrl) : null;

  const refreshRoute = () => {
    void navigate({
      to: '.',
      replace: true,
      state: {
        streamUrl: url,
        playbackUrl,
        playbackNonce: nonce + 1,
      },
    });
  };

  return (
    <Container
      sx={(theme) => ({ maxWidth: theme.layout.pageMaxWidth, pt: theme.layout.pageTopInset })}
    >
      <Button component={Link} to="/" color="inherit" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        {t('watch.back')}
      </Button>
      {playUrl ? (
        <>
          <VideoPlayer key={`${playUrl}:${nonce}`} url={playUrl} onBackToLive={refreshRoute} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all' }}>
            {streamUrl}
          </Typography>
        </>
      ) : (
        <Alert severity="error">{t('watch.error.invalidUrl')}</Alert>
      )}
    </Container>
  );
}
