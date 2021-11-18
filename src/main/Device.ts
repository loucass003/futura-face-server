export class Device implements IDevice {
  type: DeviceType;

  id: string;

  ip: string;

  constructor({ id, ip, type }: IDevice) {
    this.id = id;
    this.ip = ip;
    this.type = type;
  }

  public init() {}

  public destroy() {}
}
