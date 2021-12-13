import bonjourInit, { Bonjour } from 'bonjour';
import { WebContents, ipcMain, app } from 'electron';
import * as tf from '@tensorflow/tfjs-node';
import { TFSavedModel } from '@tensorflow/tfjs-node/dist/saved_model';
import path from 'path';
import { Device } from './Device';
import { FuturaFaceTracker } from './FuturaFaceTracker';
import { DeviceChannel } from '../ipcTypes';

export class DevicesServer {
  private bonjour!: Bonjour;

  private devices: Device[] = [];

  private renderer!: WebContents;

  public started: boolean = false;

  public faceModel!: TFSavedModel;

  public async start(sender: WebContents): Promise<void> {
    this.started = true;
    this.renderer = sender;
    // bonjourInit().publish({ name: 'FuturaServer', host: 'FuturaServer.local', type: 'futura', port: this.port })
    this.bonjour = bonjourInit();

    this.faceModel = await this.loadTensorflowModel();

    this.bonjour
      .find({ protocol: 'tcp', type: 'futura' })
      .on('up', (device) => {
        this.registerDevice({
          ip: device.addresses[0],
          type: device.txt.type as DeviceType,
          id: device.txt.id,
        });
      })
      .on('down', (device) => {});

    ipcMain.on(DeviceChannel.RequestDevices, () => {
      this.sendDevices();
    });
  }

  private registerDevice(device: IDevice) {
    let d: Device = new Device(device);
    if (device.type === 'FuturaFaceTracker') {
      d = new FuturaFaceTracker(this.renderer, this.faceModel, device);
      this.devices.push(d);
    }
    d.init();
    this.sendDevices();
  }

  public sendDevices() {
    this.renderer.send(DeviceChannel.Devices, {
      devices: this.devices.map(({ id, ip, type }) => ({ id, ip, type })),
    });
  }

  public getDevices() {
    return this.devices;
  }

  public destroyDevices() {
    this.devices.forEach((device) => {
      device.destroy();
    });
  }

  public async loadTensorflowModel(): Promise<TFSavedModel> {
    const modelPath = path.join(
      app.getPath('documents'),
      'FuturaServer',
      'models',
      'face-tracker-model'
    );

    return tf.node.loadSavedModel(
      'C:\\Users\\louca\\Documents\\Futurabeast\\futura-face\\old\\saved_model'
    );
  }

  public getDefaultFaceTraker(): FuturaFaceTracker {
    return this.getDevices().find(
      ({ type }) => type === 'FuturaFaceTracker'
    ) as FuturaFaceTracker;
  }
}
