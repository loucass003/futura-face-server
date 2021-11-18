import { ReactNode } from 'react';
import {
  FaceTrainerContext,
  useProvideFaceTrainer,
} from 'renderer/hooks/trainer/face-trainer';

interface FaceTrainerProviderProps {
  children: ReactNode;
}

export function FaceTrainerProvider({ children }: FaceTrainerProviderProps) {
  const state = useProvideFaceTrainer();

  return (
    <FaceTrainerContext.Provider value={state}>
      {children}
    </FaceTrainerContext.Provider>
  );
}
