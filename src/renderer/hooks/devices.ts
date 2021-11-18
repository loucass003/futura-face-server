import {
  createContext,
  Reducer,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { DeviceChannel } from '../../ipcTypes';
import { useNativeAPI } from './native-api';

export const FuturaDevicesContext = createContext<FuturaDevicesInformations>(
  undefined as any
);

export type DevicesActions =
  | { type: 'SET_DEVICES'; devices: IDevice[] }
  | { type: 'CLEAR_DEVICES' };

export type FuturaDevices = { [key: string]: IDevice };

export interface DevicesState {
  devices: FuturaDevices;
}

export interface FuturaDevicesInformations {
  state: DevicesState;
  refresh: () => void;
}

export function devicesReducer(
  state: DevicesState,
  action: DevicesActions
): DevicesState {
  switch (action.type) {
    case 'SET_DEVICES': {
      return {
        ...state,
        devices: action.devices.reduce(
          (devices, device) => ({
            ...devices,
            [device.id]: device,
          }),
          {}
        ),
      };
    }
    case 'CLEAR_DEVICES': {
      return {
        ...state,
        devices: {},
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

export function useProvideFuturaDevices(): FuturaDevicesInformations {
  const nativeAPI = useNativeAPI();
  const [state, dispatch] = useReducer<Reducer<DevicesState, DevicesActions>>(
    devicesReducer,
    { devices: {} }
  );

  const onDevices = (
    event: Electron.Event,
    payload: { devices: IDevice[] }
  ) => {
    dispatch({ type: 'SET_DEVICES', devices: payload.devices });
  };

  useEffect(() => {
    nativeAPI.send(DeviceChannel.CreateDeviceServer);
    nativeAPI.send(DeviceChannel.RequestDevices);
    nativeAPI.on(DeviceChannel.Devices, onDevices);
    return () => {
      nativeAPI.removeListener(DeviceChannel.Devices, onDevices);
    };
  }, []);

  return {
    state,
    refresh: () => {
      dispatch({ type: 'CLEAR_DEVICES' });
      nativeAPI.send(DeviceChannel.RequestDevices);
    },
  };
}

export function useFuturaDevices(): FuturaDevicesInformations {
  const context = useContext<FuturaDevicesInformations>(FuturaDevicesContext);
  if (context === undefined) {
    throw new Error(
      'useFuturaDevices must be used within a FuturaDevicesProvider'
    );
  }
  return context;
}
