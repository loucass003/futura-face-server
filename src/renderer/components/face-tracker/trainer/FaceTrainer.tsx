import { Button, Container, Grid } from '@mui/material';
import React, { useEffect } from 'react';
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
    state,
    currentBlendshape,
  } = useFaceTrainer();

  return (
    (!state.datasetLoading && currentBlendshape && (
      <Container>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            {currentBlendshape.imageData ? (
              <img
                src={currentBlendshape.imageData}
                alt={`${state.currentBlendshapeIndex}`}
                style={{ width: '100%' }}
              />
            ) : (
              <FaceTrackerStream />
            )}
          </Grid>
          <Grid item xs={6}>
            <Face3DView blendShapes={currentBlendshape.keys} />
            {/* <Face3DView blendShapes={blendShapes}/> */}
          </Grid>
          <Grid item xs={12}>
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
              disabled={!!state.blendshapes.find(({ imageData }) => !imageData)}
            >
              Done{' '}
              {state.blendshapes.find(({ imageData }) => !imageData) &&
                '(There is some blendshapes with no pictures)'}
            </Button>
          </Grid>
        </Grid>
      </Container>
    )) || <>Loading</>
  );
}
