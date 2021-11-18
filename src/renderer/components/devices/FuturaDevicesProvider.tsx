import { ReactNode } from 'react';
import {
  useProvideFuturaDevices,
  FuturaDevicesContext,
} from '../../hooks/devices';

interface FuturaDevicesProviderProps {
  children: ReactNode;
}

export function FuturaDevicesProvider({
  children,
}: FuturaDevicesProviderProps) {
  const state = useProvideFuturaDevices();

  return (
    <FuturaDevicesContext.Provider value={state}>
      {children}
    </FuturaDevicesContext.Provider>
  );
}
