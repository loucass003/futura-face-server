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
}

export enum FaceTrainerChannel {
  OpenDataset = 'ft-open-dataset',
  ReceiveDataset = 'ft-receive-dataset',
  TakePicture = 'ft-take-picture',
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
  [DeviceChannel.Devices]: { devices: IDevice[] };
  [FaceTrainerChannel.OpenDataset]: { name: string };
  [FaceTrainerChannel.ReceiveDataset]: { name: string; dataset?: IDataset };
  [FaceTrainerChannel.DeleteDataset]: { name: string };
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
