import { Paper } from '@mui/material';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { Model } from './FaceModel';


function Camera(props) {
  const ref = useRef(null);

  const { size } = useThree();
  const set = useThree((state) => state.set);
  useEffect(() => {
    set({ camera: ref.current });
  }, []);
  return (
    <perspectiveCamera
      ref={ref}
      {...props}
      aspect={size.width / size.height}
      radius={(size.width + size.height) / 4}
      onUpdate={(self) => self.updateProjectionMatrix()}
    />
  );
}

export function Trainer3DView({ blendShapes }: { blendShapes: number[] }) {
  return (
    <Paper>
      <Canvas style={{ height: '400px' }}>
          <Suspense fallback={null}>
            <Camera position={[0, -0.05, 0.1]} fov={60} near={0.001} />
            <pointLight position={[10, 0, 10]} />
            <pointLight position={[0, 0, 10]} intensity={0.25}/>
            <pointLight position={[0, 0, 0.3]} intensity={0.25}/>
            <Model blendShapes={blendShapes}/>
          </Suspense>
      </Canvas>
    </Paper>

  );
}
