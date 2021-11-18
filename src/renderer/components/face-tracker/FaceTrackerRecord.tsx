import {
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { useFaceRecorder } from 'renderer/hooks/face-recorder';
import { FaceTrackerStream } from './FaceTrackerStream';

export function FaceTrackerRecord() {
  const { start, cancel, recording, recordingStatus } = useFaceRecorder();

  return (
    <Container>
      <Grid container mt={2}>
        <Grid item xs={12} alignItems="center">
          <Paper>
            {!recording && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }} py={3}>
                <Typography variant="h4" align="center">
                  Record Dataset Samples
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button onClick={start}>Start Recording</Button>
                </Box>
              </Box>
            )}
            {recording && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }} py={3}>
                <Typography variant="h4" align="center">
                  Recording Samples...
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {recordingStatus === 'recording' && (
                    <FaceTrackerStream noPredictions />
                  )}
                </Box>
                <Typography variant="h5" align="center">
                  {recordingStatus}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  {recordingStatus !== 'done' && (
                    <Button onClick={cancel}>Cancel Recording</Button>
                  )}
                  {recordingStatus === 'done' && (
                    <Button component={Link} to="/face-tracker-train">
                      Go to datasets list
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
