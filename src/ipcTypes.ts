export interface FaceTrackerStatus {
  battery: number;
  flash: number;
}

export type RecordingStatus =
  | 'none'
  | 'recording'
  | 'removing-duplicates'
  | 'compressing'
  | 'done';

export type FaceServerStatus = 'streaming' | 'waiting-for-device';

export type UploadStatus = 'NONE' | 'STARTING' | 'UPLOADING' | 'DONE';

export enum FFTChannel {
  NewFrame = 'fft-new-frame',
  Status = 'fft-status',
  ServerStatus = 'fft-server-status',
  SetFlash = 'fft-set-flash',
  Watch = 'fft-watch',
}

export enum DeviceChannel {
  CreateDeviceServer = 'create-device-server',
  Devices = 'device-devices',
  RequestDevices = 'request-devices',
  RequestSerialDevices = 'request-serial-devices',
  SerialDevices = 'serial-devices',
  UploadFirmware = 'upload-firmware',
  UploadStatus = 'upload-status',
  CancelUpload = 'cancel-upload',
}

export enum FaceTrainerChannel {
  OpenDataset = 'ft-open-dataset',
  ReceiveDataset = 'ft-receive-dataset',
  RecordPose = 'ft-record-pose',
  DeleteRecord = 'ft-delete-record',
  DeleteDataset = 'ft-delete-dataset',
  SavedDatasets = 'ft-saved-datasets',
  AskSavedDatasets = 'ft-ask-saved-datasets',
  ReceiveRecord = 'ft-receive-record',
  AskRecord = 'ft-ask-record',
}

export type FFTNewFrame = {
  frame: Buffer;
  deviceId: string;
  blendShapes: number[];
};

export interface IpcChannelMap {
  [FFTChannel.NewFrame]: FFTNewFrame;
  [FFTChannel.SetFlash]: { value: number; deviceId: string };
  [FFTChannel.Status]: { status: FaceTrackerStatus; deviceId: string };
  [FFTChannel.ServerStatus]: { status: FaceServerStatus };
  [FFTChannel.Watch]: void;
  [DeviceChannel.CreateDeviceServer]: void;
  [DeviceChannel.RequestDevices]: void;
  [DeviceChannel.RequestSerialDevices]: void;
  [DeviceChannel.SerialDevices]: { devices: string[] };
  [DeviceChannel.CancelUpload]: void;
  [DeviceChannel.UploadFirmware]: {
    device: string;
    command: string;
    deviceType: DeviceType;
  };
  [DeviceChannel.UploadStatus]: {
    status: UploadStatus;
    exitCode?: number;
    progress?: number;
  };
  [DeviceChannel.Devices]: { devices: IDevice[] };
  [FaceTrainerChannel.OpenDataset]: { name: string };
  [FaceTrainerChannel.ReceiveDataset]: { name: string; dataset?: IDataset };
  [FaceTrainerChannel.DeleteDataset]: { name: string };
  [FaceTrainerChannel.DeleteRecord]: { name: string; index: number };
  [FaceTrainerChannel.RecordPose]: {
    dataset: string;
    index: number;
    blendshapes: number[];
    shapesCount: number;
  };
  [FaceTrainerChannel.AskRecord]: { index: number; dataset: string };
  [FaceTrainerChannel.ReceiveRecord]: { frames: string[]; index: number };
  [FaceTrainerChannel.SavedDatasets]: { datasets_names: string[] };
  [FaceTrainerChannel.AskSavedDatasets]: void;
}
