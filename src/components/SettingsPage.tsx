import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { isLiveDelay, LIVE_DELAY_OPTIONS } from '@/lib/hls/playerPrefs';
import { isAppLocale, SUPPORTED_LOCALES } from '@/lib/locale';
import { useLocaleStore } from '@/stores/locale';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function SettingsPage() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const liveDelaySec = usePlayerPrefsStore((s) => s.liveDelaySec);
  const setLiveDelay = usePlayerPrefsStore((s) => s.setLiveDelay);

  return (
    <Container
      sx={(theme) => ({ maxWidth: theme.layout.pageMaxWidth, pt: theme.layout.pageTopInset })}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t('settings.title')}
      </Typography>
      <Stack spacing={4}>
        <FormControl>
          <FormLabel id="settings-language-label">{t('settings.language')}</FormLabel>
          <RadioGroup
            aria-labelledby="settings-language-label"
            row
            value={locale}
            onChange={(_event, value) => {
              if (isAppLocale(value)) setLocale(value);
            }}
          >
            {SUPPORTED_LOCALES.map((code) => (
              <FormControlLabel
                key={code}
                value={code}
                control={<Radio />}
                label={t(`locale.${code}`)}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel id="settings-live-delay-label">{t('settings.liveDelay')}</FormLabel>
          <RadioGroup
            aria-labelledby="settings-live-delay-label"
            row
            value={liveDelaySec}
            onChange={(_event, value) => {
              const next = Number(value);
              if (isLiveDelay(next)) setLiveDelay(next);
            }}
          >
            {LIVE_DELAY_OPTIONS.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio />}
                label={t('settings.liveDelayOption', { seconds: option })}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Stack>
    </Container>
  );
}
