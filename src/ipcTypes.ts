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
  TakePicture = 'ft-take-picture',
  DeletePicture = 'ft-delete-picture',
  DeleteDataset = 'ft-delete-dataset',
  SavedDatasets = 'ft-saved-datasets',
  AskSavedDatasets = 'ft-ask-saved-datasets',
  ReceiveTookPicture = 'ft-receive-took-picture',
  AskPicture = 'ft-ask-picture',
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
  [FaceTrainerChannel.DeletePicture]: { name: string; index: number };
  [FaceTrainerChannel.TakePicture]: {
    dataset: string;
    index: number;
    blendshapes: number[];
    shapesCount: number;
  };
  [FaceTrainerChannel.AskPicture]: { index: number; dataset: string };
  [FaceTrainerChannel.ReceiveTookPicture]: { image: string; index: number };
  [FaceTrainerChannel.SavedDatasets]: { datasets_names: string[] };
  [FaceTrainerChannel.AskSavedDatasets]: void;
}
