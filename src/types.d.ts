type DeviceType = 'FuturaFaceTracker' | 'FuturaControllers';

interface IDevice {
  type: DeviceType;
  id: string;
  ip: string;
}

interface IBlendshape {
  keys: number[];
  imageData: string;
}

interface IDataset {
  blendshapes: IBlendshape[];
}
