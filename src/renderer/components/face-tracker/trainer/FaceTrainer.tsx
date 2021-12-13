import { Button, Container, Grid } from '@mui/material';
import React, { useEffect } from 'react';
import { Face3DView } from 'renderer/components/commons/Face3DView';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { FaceTrackerStream } from '../FaceTrackerStream';

export function FaceTrainer() {
  const { newBlendShape, takePicture, state, currentBlendshape } =
    useFaceTrainer();

  useEffect(() => {
    newBlendShape();
  }, []);

  console.log(currentBlendshape);

  return (
    (currentBlendshape && (
      <Container>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            {currentBlendshape.image ? (
              <img src={currentBlendshape.image} alt={currentBlendshape.name} />
            ) : (
              <FaceTrackerStream />
            )}
          </Grid>
          <Grid item xs={6}>
            <Face3DView blendShapes={currentBlendshape.keys} />
            {/* <Face3DView blendShapes={blendShapes}/> */}
          </Grid>
          <Grid item xs={12}>
            <Button onClick={takePicture}>Take picture</Button>
            <Button>Save</Button>
          </Grid>
        </Grid>
      </Container>
    )) || <>Loading</>
  );
}
