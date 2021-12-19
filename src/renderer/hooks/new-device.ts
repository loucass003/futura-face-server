import { DeviceChannel, UploadStatus } from 'ipcTypes';
import { Reducer, useEffect, useReducer } from 'react';
import { useNativeAPI } from './native-api';

export type DevicesActions =
  | { type: 'SET_DEVICES'; devices: string[] }
  | { type: 'CLEAR_DEVICES' }
  | { type: 'current-device'; device: string }
  | { type: 'set-command'; command: string }
  | { type: 'current-device-type'; deviceType: DeviceType }
  | {
      type: 'upload-status';
      status: UploadStatus;
      exitCode?: number;
      progress?: number;
    };

export interface DevicesState {
  devices: string[];
  currentDevice?: string;
  deviceType: DeviceType;
  esptoolCommand: string;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  uploadExitCode: number;
}

export interface NewDevicesInformations {
  state: DevicesState;
  refresh: () => void;
  setDevice: (device: string) => void;
  setCommand: (command: string) => void;
  uploadFirmware: () => void;
  setDeviceType: (deviceType: DeviceType) => void;
  done: () => void;
  cancel: () => void;
}

export function devicesReducer(
  state: DevicesState,
  action: DevicesActions
): DevicesState {
  switch (action.type) {
    case 'SET_DEVICES': {
      return {
        ...state,
        devices: action.devices,
      };
    }
    case 'CLEAR_DEVICES': {
      return {
        ...state,
        devices: [],
      };
    }
    case 'current-device': {
      return {
        ...state,
        currentDevice: action.device,
      };
    }
    case 'current-device-type': {
      return {
        ...state,
        deviceType: action.deviceType,
      };
    }
    case 'upload-status': {
      return {
        ...state,
        uploadStatus: action.status,
        uploadProgress: action.progress
          ? action.progress
          : state.uploadProgress,
        uploadExitCode: action.exitCode
          ? action.exitCode
          : state.uploadExitCode,
      };
    }
    case 'set-command': {
      return {
        ...state,
        esptoolCommand: action.command,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

export function useNewDevice(): NewDevicesInformations {
  const nativeAPI = useNativeAPI();
  const [state, dispatch] = useReducer<Reducer<DevicesState, DevicesActions>>(
    devicesReducer,
    {
      devices: [],
      currentDevice: 'none',
      deviceType: 'FuturaFaceTracker',
      esptoolCommand: `{ESPTOOL_PATH}\n --chip esp32\n --port {DEVICE_PORT}\n --baud 460800\n --before default_reset\n --after hard_reset write_flash\n -z\n --flash_mode dio\n --flash_freq 40m\n --flash_size detect\n 0x1000 {ESPRESSIF_BOOTLOADER_PATH}\n 0x8000 {DEVICE_PARTITION_PATH}\n 0xe000 {ESPRESSIF_BOOT_PATH}\n 0x10000 {DEVICE_FIRMWARE_PATH}`,
      uploadStatus: 'NONE',
      uploadProgress: 0,
      uploadExitCode: 0,
    }
  );

  const onSerialDevices = (event, { devices }) => {
    dispatch({ type: 'SET_DEVICES', devices });
  };

  const onUploadStatus = (event, payload) => {
    dispatch({ type: 'upload-status', ...payload });
  };

  useEffect(() => {
    nativeAPI.on(DeviceChannel.SerialDevices, onSerialDevices);
    nativeAPI.on(DeviceChannel.UploadStatus, onUploadStatus);

    nativeAPI.send(DeviceChannel.RequestSerialDevices);

    return () => {
      nativeAPI.removeListener(DeviceChannel.SerialDevices, onSerialDevices);
      nativeAPI.removeListener(DeviceChannel.UploadStatus, onUploadStatus);
    };
  }, []);

  return {
    state,
    setDeviceType: (deviceType: DeviceType) =>
      dispatch({ type: 'current-device-type', deviceType }),
    setDevice: (device: string) => dispatch({ type: 'current-device', device }),
    setCommand: (command: string) => dispatch({ type: 'set-command', command }),
    refresh: () => {
      dispatch({ type: 'CLEAR_DEVICES' });
      nativeAPI.send(DeviceChannel.RequestSerialDevices);
    },
    done: () => {
      dispatch({ type: 'upload-status', status: 'NONE', progress: 0 });
    },
    cancel: () => {
      dispatch({ type: 'upload-status', status: 'NONE', progress: 0 });
      nativeAPI.send(DeviceChannel.CancelUpload);
    },
    uploadFirmware: () => {
      dispatch({ type: 'upload-status', status: 'STARTING', progress: 0 });
      nativeAPI.send(DeviceChannel.UploadFirmware, {
        device: state.currentDevice,
        deviceType: state.deviceType,
        command: state.esptoolCommand,
      });
    },
  };
}
