import { useFaceTracker } from '../../hooks/face-tracker';

export function FaceTrackerStream() {
  const { canvas, serverStatus } = useFaceTracker();
  return serverStatus === 'streaming' ? (
    <canvas ref={canvas} width="100%" height="100%" style={{ width: '100%' }} />
  ) : (
    <>Waiting for device</>
  );
}
