import { createFileRoute } from '@tanstack/react-router';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

const GITHUB_URL = 'https://github.com/mengtaoxin/tdhls';

function AboutPage() {
  const { t } = useTranslation();

  return (
    <Container sx={(theme) => ({ textAlign: 'center', pt: theme.layout.pageTopInset })}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        tdhls
      </Typography>
      <IconButton
        component="a"
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('about.github')}
        color="inherit"
        size="large"
      >
        <GitHubIcon fontSize="large" />
      </IconButton>
    </Container>
  );
}
