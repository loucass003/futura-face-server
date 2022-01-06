import bonjourInit, { Bonjour } from 'bonjour';
import { WebContents, ipcMain, app } from 'electron';
import * as tf from '@tensorflow/tfjs-node-gpu';
import { TFSavedModel } from '@tensorflow/tfjs-node-gpu/dist/saved_model';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Device } from './Device';
import { FuturaFaceTracker } from './FuturaFaceTracker';
import { DeviceChannel } from '../ipcTypes';
import { getSerialPorts } from './util';
import { BINARIES_PATHS, FIRMWARES_PATHS, MODELS_PATHS } from './binaries';
import { getPlatform } from './platform';

export class DevicesServer {
  private bonjour!: Bonjour;

  private devices: Device[] = [];

  private renderer!: WebContents;

  public started: boolean = false;

  public faceModel!: TFSavedModel;

  public uploadProcess: ChildProcessWithoutNullStreams;

  public async start(sender: WebContents): Promise<void> {
    this.started = true;
    this.renderer = sender;
    // bonjourInit().publish({ name: 'FuturaServer', host: 'FuturaServer.local', type: 'futura', port: this.port })
    this.bonjour = bonjourInit();

    // Maybe load it only if there is at least a face tracker a some point
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

    ipcMain.on(DeviceChannel.RequestSerialDevices, async (event) => {
      event.sender.send(DeviceChannel.SerialDevices, {
        devices: await getSerialPorts(),
      });
    });

    ipcMain.on(
      DeviceChannel.UploadFirmware,
      async (event, { device, deviceType, command }) => {
        const esptoolPath = BINARIES_PATHS.esptool;
        const firmwarePath = FIRMWARES_PATHS[deviceType];

        const [path, ...args] = command
          .replaceAll('{ESPTOOL_PATH}', esptoolPath)
          .replaceAll('{DEVICE_PORT}', device)
          .replaceAll(
            '{ESPRESSIF_BOOTLOADER_PATH}',
            FIRMWARES_PATHS.espressif.bootloader
          )
          .replaceAll('{DEVICE_PARTITION_PATH}', firmwarePath.partitions)
          .replaceAll('{ESPRESSIF_BOOT_PATH}', FIRMWARES_PATHS.espressif.boot)
          .replaceAll('{DEVICE_FIRMWARE_PATH}', firmwarePath.firmware)
          .replaceAll('\n', '')
          .split(' ');

        this.uploadProcess = spawn(path, args);

        event.sender.send(DeviceChannel.UploadStatus, {
          status: 'STARTING',
          progress: 0,
        });

        this.uploadProcess.stdout.on('data', (data) => {
          if (this.uploadProcess) {
            const progressMatch = data
              .toString()
              .match(/Writing at \S+\.\.\. \((?<progress>\d+) %\)/);
            if (progressMatch) {
              event.sender.send(DeviceChannel.UploadStatus, {
                status: 'UPLOADING',
                progress: +progressMatch.groups.progress,
              });
            }
          }
        });

        this.uploadProcess.on('close', (exitCode) => {
          if (this.uploadProcess) {
            event.sender.send(DeviceChannel.UploadStatus, {
              status: 'DONE',
              exitCode,
              progress: 0,
            });
          }
        });
      }
    );

    ipcMain.on(DeviceChannel.CancelUpload, (event) => {
      if (!this.uploadProcess) return;
      if (getPlatform() === 'win')
        spawn('taskkill', ['/pid', `${this.uploadProcess.pid}`, '/f', '/t']);
      else this.uploadProcess.kill('SIGKILL');
      event.sender.send(DeviceChannel.UploadStatus, {
        status: 'NONE',
        exitCode: 0,
        progress: 0,
      });
      this.uploadProcess = null;
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
    return tf.node.loadSavedModel(MODELS_PATHS.FuturaFaceTracker);
  }

  public getDefaultFaceTraker(): FuturaFaceTracker {
    return this.getDevices().find(
      ({ type }) => type === 'FuturaFaceTracker'
    ) as FuturaFaceTracker;
  }
}
