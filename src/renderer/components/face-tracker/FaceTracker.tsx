import { Button, Container, Grid, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useFaceTracker } from 'renderer/hooks/face-tracker';
import { FaceTrackerStatus } from './FaceTrackerStatus';
import { FaceTrackerStream } from './FaceTrackerStream';
import { Trainer3DView } from './trainer/Trainer3DView';

export function FaceTracker() {
  const { device, serverStatus, blendShapes } = useFaceTracker();

  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Typography variant="h4" pb={2}>
            Face Tracker {device.id}
          </Typography>
          <Paper>
            <Button
              component={Link}
              to={`/FuturaFaceTracker/${device.id}/record`}
              disabled={serverStatus !== 'streaming'}
            >
              Record Dataset
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <FaceTrackerStatus />
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={2}>
            <Typography variant="h5" gutterBottom component="div">
              Face Tracker Stream
            </Typography>
            <FaceTrackerStream noPredictions={false} />
            {blendShapes && blendShapes.length > 0 && <Trainer3DView blendShapes={blendShapes}/>}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
