import { useParams } from 'react-router-dom';

import { Box, Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export default function PublicationDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <title>{`Publication ${id} - ${CONFIG.appName}`}</title>
      <Container sx={{ py: 5 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Publication Details for ID: {id}
          </Typography>
          <Typography variant="body1">
            This is a placeholder for the publication details view.
            Here you would fetch and display the specific publication content.
          </Typography>
        </Box>
      </Container>
    </>
  );
}
