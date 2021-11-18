import { ReactNode } from 'react';
import {
  useProvideFaceTracker,
  FaceTrackerContext,
} from '../../hooks/face-tracker';

interface FaceTrackerProviderProps {
  children: ReactNode;
}

export function FaceTrackerProvider({ children }: FaceTrackerProviderProps) {
  const state = useProvideFaceTracker();

  return (
    <FaceTrackerContext.Provider value={state}>
      {children}
    </FaceTrackerContext.Provider>
  );
}
