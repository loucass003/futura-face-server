import { Button, Container, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

export function FaceTrackerSettings() {
  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <Button component={Link} to="/face-tracker-train">
            Train
          </Button>
        </Grid>
        <Grid item xs={6} />
      </Grid>
    </Container>
  );
}
