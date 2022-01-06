import { Button, Container, Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { Face3DView } from 'renderer/components/commons/Face3DView';
import { useFaceTracker } from 'renderer/hooks/face-tracker';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { FaceTrackerStream } from '../FaceTrackerStream';

export function FaceTrainer() {
  const { serverStatus } = useFaceTracker();

  const {
    takeRecord,
    deleteRecord,
    addBlendshape,
    prevBlendshape,
    nextBlendshape,
    deleteBlendshape,
    randomBlendshape,
    state,
    currentBlendshape,
    blendshapesCount,
  } = useFaceTrainer();

  return (
    (!state.datasetLoading && currentBlendshape && (
      <Container>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Paper>
              {currentBlendshape.recordExists ? (
                <Button onClick={deleteRecord}>Delete record</Button>
              ) : (
                <Button
                  onClick={takeRecord}
                  disabled={
                    state.recording || serverStatus === 'waiting-for-device'
                  }
                >
                  Take record
                </Button>
              )}

              <Button
                onClick={addBlendshape}
                disabled={
                  state.currentBlendshapeIndex !== blendshapesCount - 1 ||
                  state.recording ||
                  serverStatus === 'waiting-for-device'
                }
              >
                Add Blendshape
              </Button>

              <Button
                onClick={deleteBlendshape}
                disabled={
                  blendshapesCount - 1 !== state.currentBlendshapeIndex ||
                  state.currentBlendshapeIndex === 0 ||
                  state.recording ||
                  serverStatus === 'waiting-for-device'
                }
              >
                Delete Blendshape
              </Button>

              <Button
                onClick={randomBlendshape}
                disabled={
                  state.recording || serverStatus === 'waiting-for-device'
                }
              >
                Random Blendshape
              </Button>

              <Button
                onClick={prevBlendshape}
                disabled={
                  state.currentBlendshapeIndex === 0 ||
                  state.recording ||
                  serverStatus === 'waiting-for-device'
                }
              >
                Prev
              </Button>
              {`${state.currentBlendshapeIndex + 1} / ${blendshapesCount}`}
              <Button
                onClick={nextBlendshape}
                disabled={
                  state.currentBlendshapeIndex === blendshapesCount - 1 ||
                  state.recording ||
                  serverStatus === 'waiting-for-device'
                }
              >
                NEXT
              </Button>

              <Button
                component={Link}
                to="/face-tracker-datasets"
                disabled={
                  state.currentBlendshapeIndex !== blendshapesCount - 1 ||
                  state.recording ||
                  serverStatus === 'waiting-for-device'
                }
              >
                Done
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper>
              <Box p={2}>
                {!state.imageLoading ? (
                  <>
                    {currentBlendshape.recordExists && state.currentRecord ? (
                      <video
                        width="240"
                        height="240"
                        controls
                        style={{ width: '100%' }}
                      >
                        <source src={state.currentRecord} type="video/mp4" />
                      </video>
                    ) : (
                      <FaceTrackerStream />
                    )}
                  </>
                ) : (
                  <>Loading....</>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Face3DView blendShapes={currentBlendshape.keys} />
            {/* <Face3DView blendShapes={blendShapes}/> */}
          </Grid>
        </Grid>
      </Container>
    )) || <>Loading</>
  );
}
