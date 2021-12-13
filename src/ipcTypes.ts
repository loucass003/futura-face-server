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
  SavePicture = 'save-picture',
  DeleteDataset = 'delete-dataset',
  SavedDatasets = 'saved-datasets',
  AskSavedDatasets = 'ask-saved-datasets',
}

export enum FaceRecorderChannel {
  StartRecording = 'start-recording',
  RecordingStatus = 'recording-status',
  CancelRecording = 'cancel-recording',
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
  [FaceTrainerChannel.DeleteDataset]: { name: string };
  [FaceTrainerChannel.SavePicture]: { image: Buffer; name: string };
  [FaceTrainerChannel.SavedDatasets]: { datasets_names: string[] };
  [FaceTrainerChannel.AskSavedDatasets]: void;
  [FaceRecorderChannel.StartRecording]: void;
  [FaceRecorderChannel.CancelRecording]: void;
  [FaceRecorderChannel.RecordingStatus]: {
    status: RecordingStatus;
  };
}
