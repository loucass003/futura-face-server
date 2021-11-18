import { Grid, Paper, Slider, Typography } from '@mui/material';
import { shapeKeys } from 'common-types';
import { useFaceTrainer } from 'renderer/hooks/trainer/face-trainer';

const mergedShapes = {
  mouthLip: [
    'MouthUpperUpRight',
    'MouthUpperUpLeft',
    'MouthLowerDownRight',
    'MouthLowerDownLeft',
  ],
  mouthLower: [
    'MouthLowerRight',
    'MouthLowerLeft',
    'MouthLowerInside',
    'MouthLowerOverlay',
    'MouthLowerOverturn',
  ],
  mouthUpper: [
    'MouthUpperRight',
    'MouthUpperLeft',
    'MouthUpperInside',
    'MouthUpperOverturn',
  ],
  mouth: [
    'MouthApeShape',
    'MouthPout',
    'MouthSmileRight',
    'MouthSmileLeft',
    'MouthSadRight',
    'MouthSadLeft',
  ],
  jaw: ['JawRight', 'JawLeft', 'JawForward', 'JawOpen'],
  cheeks: ['CheekPuffRight', 'CheekPuffLeft', 'CheekSuck'],
  tongue: [
    'TongueLongStep1',
    'TongueLongStep2',
    'TongueDown',
    'TongueUp',
    'TongueRight',
    'TongueLeft',
    'TongueRoll',
    'TongueUpLeftMorph',
    'TongueUpRightMorph',
    'TongueDownLeftMorph',
    'TongueDownRightMorph',
  ],
};

export function TrainerBlendShape() {
  const { setBlendShape, state } = useFaceTrainer();

  return (
    <Paper>
      <Grid container>
        {Object.keys(mergedShapes).map((key) => (
          <Grid item xs={12} key={key} px={1}>
            <Typography variant="h6">{key}</Typography>
            <Grid container>
              {mergedShapes[key].map((key) => (
                <Grid item xs={4} px={1} key={key}>
                  <Typography variant="caption">{key}</Typography>
                  <Slider
                    value={state.blendShapes[shapeKeys.indexOf(key)]}
                    max={1}
                    step={0.001}
                    size="small"
                    onChange={setBlendShape(key)}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
