'use client'

import { Grid, Typography } from '@mui/material'

import { PageWrapper } from '@/components'
import { useTranslation } from '@/lib/i18n'

import { ui } from './styled'

const Page = () => {
  const sx = ui()
  const { t } = useTranslation()

  return (
    <PageWrapper>
      <Grid container spacing={4} sx={{ px: { xs: 3, md: 6 }, pt: { xs: 2, md: 6 } }}>
        <Grid size={12} sx={{ maxWidth: 600 }}>
          <Typography color="primary" variant="body2" sx={sx.code}>
            :(
          </Typography>
          <Typography color="primary" variant="body2" sx={sx.title}>
            {t('ERROR_PAGE.TITLE')}
          </Typography>
          <Typography color="secondary" variant="body2" sx={{ mb: 4 }}>
            {t('ERROR_PAGE.BLURB')}
          </Typography>
        </Grid>
      </Grid>
    </PageWrapper>
  )
}

export default Page
