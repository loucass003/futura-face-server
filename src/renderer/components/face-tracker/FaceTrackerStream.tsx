import { useEffect } from 'react';
import { useFaceTracker } from '../../hooks/face-tracker';

export function FaceTrackerStream({
  noPredictions = false,
}: {
  noPredictions: boolean;
}) {
  const { canvas, setPredictions } = useFaceTracker();

  useEffect(() => {
    setPredictions(!noPredictions);
  }, []);

  return (
    <div style={{ margin: '15px' }}>
      <canvas
        ref={canvas}
        width="100%"
        height="100%"
        style={{ width: '100%' }}
      />
    </div>
  );
}
