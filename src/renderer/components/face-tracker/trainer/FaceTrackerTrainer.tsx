import { Button, Container, Grid, Paper } from '@mui/material';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { SavedDatasetsList } from './SavedDatasetsList';
import { Trainer3DView } from './Trainer3DView';
import { TrainerBlendShape } from './TrainerBlendShape';
import { TrainerControls } from './TrainerControls';
import { TrainerImageView } from './TrainerImageView';

export function FaceTrackerTainer() {
  const { state } = useFaceTrainer()

  return (
    <Container>
        {state.datasetLoaded && <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <TrainerControls />
          </Grid>
          <Grid item xs={4}>
            <TrainerImageView></TrainerImageView>
            <Trainer3DView blendShapes={state.blendShapes}/>
          </Grid>
          <Grid item xs={8}>
            <TrainerBlendShape></TrainerBlendShape>
          </Grid>
        </Grid>}
    </Container>
  );
}
