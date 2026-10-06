import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useTranslation } from 'react-i18next';

import { parseStreamUrl } from '@/lib/hls/streamUrl';
import { applyUrlFunction } from '@/lib/hls/urlFunction';
import { usePlayerPrefsStore } from '@/stores/playerPrefs';

export function StreamUrlForm({ onPlay }: { onPlay: (url: string) => void }) {
  const { t } = useTranslation();
  const urlFunction = usePlayerPrefsStore((s) => s.urlFunction);
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseStreamUrl(value);
    if (!parsed) {
      setInvalid(true);
      return;
    }
    onPlay(applyUrlFunction(urlFunction, parsed));
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={onSubmit}
      sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}
    >
      <TextField
        label={t('home.urlLabel')}
        type="url"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setInvalid(false);
        }}
        error={invalid}
        helperText={invalid ? t('home.invalidUrl') : ' '}
        autoComplete="url"
        sx={{ flex: '1 1 20rem' }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        sx={{ mt: 0.5 }}
      >
        {t('home.play')}
      </Button>
    </Box>
  );
}
