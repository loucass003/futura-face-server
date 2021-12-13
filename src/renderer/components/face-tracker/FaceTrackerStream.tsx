import { useFaceTracker } from '../../hooks/face-tracker';

export function FaceTrackerStream() {
  const { canvas } = useFaceTracker();
  return (
    <canvas ref={canvas} width="100%" height="100%" style={{ width: '100%' }} />
  );
}
