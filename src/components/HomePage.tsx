import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

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
      <Alert severity="info">{t('home.comingSoon')}</Alert>
    </Container>
  );
}
