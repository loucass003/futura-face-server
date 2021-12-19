import { Button, Container, Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { Link } from 'react-router-dom';
import { Face3DView } from 'renderer/components/commons/Face3DView';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { FaceTrackerStream } from '../FaceTrackerStream';

export function FaceTrainer() {
  const {
    takePicture,
    deletePicture,
    addBlendshape,
    prevBlendshape,
    nextBlendshape,
    deleteBlendshape,
    randomBlendshape,
    state,
    currentBlendshape,
  } = useFaceTrainer();

  return (
    (!state.datasetLoading && currentBlendshape && (
      <Container>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Paper>
              {currentBlendshape.imageData ? (
                <Button onClick={deletePicture}>Delete picture</Button>
              ) : (
                <Button onClick={takePicture}>Take picture</Button>
              )}

              <Button
                onClick={addBlendshape}
                disabled={
                  state.currentBlendshapeIndex >= state.blendshapes.length
                }
              >
                Add Blendshape
              </Button>

              <Button
                onClick={deleteBlendshape}
                disabled={state.blendshapes.length === 1}
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
                state.blendshapes.length
              }`}
              <Button
                onClick={nextBlendshape}
                disabled={
                  state.currentBlendshapeIndex === state.blendshapes.length - 1
                }
              >
                NEXT
              </Button>

              <Button
                component={Link}
                to="/face-tracker-datasets"
                disabled={
                  !!state.blendshapes.find(({ imageExists }) => !imageExists)
                }
              >
                Done{' '}
                {state.blendshapes.find(({ imageExists }) => !imageExists) &&
                  '(There is some blendshapes with no pictures)'}
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper>
              <Box p={2}>
                {!state.imageLoading ? (
                  <>
                    {currentBlendshape.imageData ? (
                      <img
                        src={currentBlendshape.imageData}
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
            <Face3DView blendShapes={currentBlendshape.keys} />
            {/* <Face3DView blendShapes={blendShapes}/> */}
          </Grid>
        </Grid>
      </Container>
    )) || <>Loading</>
  );
}
