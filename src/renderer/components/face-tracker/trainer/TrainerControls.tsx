import { Button, Paper } from '@mui/material';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';

export function TrainerControls() {
  const { state, nextImage, prevImage, reset, save } = useFaceTrainer();

  return (
    <Paper>
      <Button disabled={state.currImageIndex === 0} onClick={prevImage}>
        Prev
      </Button>
      <Button
        disabled={state.currImageIndex === state.imagesCount - 1}
        onClick={nextImage}
      >
        Next
      </Button>
      <Button onClick={reset}>Reset</Button>
      {state.currImageIndex + 1} / {state.imagesCount}
      <Button onClick={save}>Save</Button>
    </Paper>
  );
}
