import { Paper } from '@mui/material';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';

export function TrainerImageView() {
  const { state } = useFaceTrainer();

  return (
    <Paper>
      {state.imageLoading && state.image ? (
        'loading'
      ) : (
        <img src={state.image} alt="bruh" style={{ width: '100%' }} />
      )}
    </Paper>
  );
}
