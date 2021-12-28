import { Button, Container, Grid, Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { useFaceTracker } from 'renderer/hooks/face-tracker';
import { GoBackButton } from '../commons/GoBackButton';
import { FaceTrackerStatus } from './FaceTrackerStatus';
import { FaceTrackerStream } from './FaceTrackerStream';
import { Face3DView } from '../commons/Face3DView';

export function FaceTracker() {
  const { device, serverStatus, blendShapes } = useFaceTracker();

  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Typography variant="h4" pb={2} color="textPrimary">
            <GoBackButton />
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
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h5" gutterBottom component="div">
                Face Tracker Stream
              </Typography>
              <FaceTrackerStream />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={2}>
            <Box p={2}>
              <Typography variant="h5" gutterBottom component="div">
                Face Tracker 3D View
              </Typography>
              {blendShapes && blendShapes.length > 0 && (
                <Face3DView blendShapes={blendShapes} />
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <FaceTrackerStatus />
        </Grid>
      </Grid>
    </Container>
  );
}
