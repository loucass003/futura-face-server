import { Button, Container, Grid, Paper, Typography } from '@mui/material';
import { GoBackButton } from 'renderer/components/commons/GoBackButton';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';
import { SavedDatasetsList } from './SavedDatasetsList';
import { Face3DView } from '../../commons/Face3DView';
import { TrainerBlendShape } from './TrainerBlendShape';
import { TrainerControls } from './TrainerControls';
import { TrainerImageView } from './TrainerImageView';

export function FaceTrackerTainer() {
  const { state } = useFaceTrainer()

  return (
    <Container>
        <GoBackButton />
        <Typography variant="h4" color="textPrimary">
          Face Tracker Trainer
        </Typography>
        {state.datasetLoaded && <Grid container spacing={2}>
          <Grid item xs={12}>
            <TrainerControls />
          </Grid>
          <Grid item xs={4}>
            <TrainerImageView></TrainerImageView>
            <Face3DView blendShapes={state.blendShapes}/>
          </Grid>
          <Grid item xs={8}>
            <TrainerBlendShape></TrainerBlendShape>
          </Grid>
        </Grid>}
    </Container>
  );
}
