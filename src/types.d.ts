type DeviceType = 'FuturaFaceTracker' | 'FuturaControllers';

interface IDevice {
  type: DeviceType;
  id: string;
  ip: string;
}
