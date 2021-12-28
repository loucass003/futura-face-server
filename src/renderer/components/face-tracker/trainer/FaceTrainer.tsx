import { Button, Container, Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { Face3DView } from 'renderer/components/commons/Face3DView';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { FaceTrackerStream } from '../FaceTrackerStream';

export function FaceTrainer() {
  const {
    takeRecord,
    deleteRecord,
    addBlendshape,
    prevBlendshape,
    nextBlendshape,
    deleteBlendshape,
    randomBlendshape,
    state,
  } = useFaceTrainer();

  return (
    (!state.datasetLoading && state.currentBlendshape && (
      <Container>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Paper>
              {state.currentRecord ? (
                <Button onClick={deleteRecord}>Delete record</Button>
              ) : (
                <Button onClick={takeRecord}>Take record</Button>
              )}

              <Button
                onClick={addBlendshape}
                disabled={
                  state.currentBlendshapeIndex !== state.blendshapesCount - 1 ||
                  !state.currentRecord ||
                  state.recordLoading
                }
              >
                Add Blendshape
              </Button>

              <Button
                onClick={deleteBlendshape}
                disabled={
                  state.blendshapesCount - 1 !== state.currentBlendshapeIndex ||
                  state.currentBlendshapeIndex === 0
                }
              >
                Delete Blendshape
              </Button>

              <Button onClick={randomBlendshape}>Random Blendshape</Button>

              <Button
                onClick={prevBlendshape}
                disabled={state.currentBlendshapeIndex === 0}
              >
                Prev
              </Button>
              {`${state.currentBlendshapeIndex + 1} / ${
                state.blendshapesCount
              }`}
              <Button
                onClick={nextBlendshape}
                disabled={
                  state.currentBlendshapeIndex === state.blendshapesCount - 1
                }
              >
                NEXT
              </Button>

              <Button
                component={Link}
                to="/face-tracker-datasets"
                disabled={
                  !state.currentBlendshape ||
                  state.recordLoading ||
                  !state.currentRecord
                }
              >
                Done
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper>
              <Box p={2}>
                {!state.recordLoading ? (
                  <>
                    {state.currentRecord ? (
                      <img
                        src={state.currentRecord[0]}
                        alt={`${state.currentBlendshapeIndex}`}
                        style={{ width: '100%' }}
                      />
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
            <Face3DView blendShapes={state.currentBlendshape} />
            {/* <Face3DView blendShapes={blendShapes}/> */}
          </Grid>
        </Grid>
      </Container>
    )) || <>Loading</>
  );
}
