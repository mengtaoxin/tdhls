import { useRef, type KeyboardEvent } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

import { PlayerControls } from '@/components/PlayerControls';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { useVideoControls } from '@/hooks/useVideoControls';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function VideoPlayer({ url }: { url: string }) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveDelaySec = usePlayerPrefsStore((s) => s.liveDelaySec);
  const setLiveDelay = usePlayerPrefsStore((s) => s.setLiveDelay);

  const player = useHlsPlayer(videoRef, url, liveDelaySec);
  const controls = useVideoControls(videoRef, containerRef);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Space on a focused button already activates that button.
    if (event.key === ' ' && event.target === event.currentTarget) {
      event.preventDefault();
      controls.togglePlay();
    } else if (event.key === 'm' || event.key === 'M') {
      controls.toggleMute();
    }
  };

  return (
    <>
      <Box
        ref={containerRef}
        role="region"
        aria-label={t('watch.player')}
        tabIndex={0}
        onKeyDown={onKeyDown}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: theme.layout.radiusLg,
          overflow: 'hidden',
          '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}` },
          '&:fullscreen': { borderRadius: 0 },
          '&:fullscreen video': { flex: 1, minHeight: 0, aspectRatio: 'auto' },
        })}
      >
        <Box
          component="video"
          ref={videoRef}
          data-testid="player-video"
          autoPlay
          playsInline
          onClick={controls.togglePlay}
          sx={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'contain',
            bgcolor: 'common.black',
            cursor: 'pointer',
          }}
        />
        <PlayerControls
          controls={controls}
          isLive={player.isLive}
          latency={player.latency}
          liveDelaySec={liveDelaySec}
          onLiveDelayChange={setLiveDelay}
          onBackToLive={player.seekToLiveSync}
        />
      </Box>
      {player.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t(`watch.error.${player.error}`)}
        </Alert>
      )}
    </>
  );
}
