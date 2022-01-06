import Pj2 from 'pipe2jpeg';
import { spawn, ChildProcessByStdio } from 'child_process';
import { WebContents, ipcMain } from 'electron';
import fetch from 'cross-fetch';
import { Subject } from 'rxjs';
import { URLSearchParams } from 'url';
import * as tf from '@tensorflow/tfjs-node-gpu';
import { TFSavedModel } from '@tensorflow/tfjs-node-gpu/dist/saved_model';
import { Tensor } from '@tensorflow/tfjs-node-gpu';
import { shapeKeys } from '../common-types';
import { FaceServerStatus, FaceTrackerStatus, FFTChannel } from '../ipcTypes';
import { Device } from './Device';
import { BINARIES_PATHS } from './binaries';

export class FuturaFaceTracker extends Device {
  public status!: FaceTrackerStatus;

  public serverStatus: FaceServerStatus = 'waiting-for-device';

  public ffmpeg?: ChildProcessByStdio<null, any, null>;

  private poolingInterval!: NodeJS.Timer;

  public currentFrame: Buffer;

  public newFramesSubject = new Subject<Buffer>();

  constructor(
    private renderer: WebContents,
    private model: TFSavedModel,
    { id, ip }: IDevice
  ) {
    super({ id, ip, type: 'FuturaFaceTracker' });
  }

  get streamUrl(): string {
    return `http://${this.ip}:81/stream`;
  }

  public init() {
    super.init();
    this.startStreaming();
    this.toggleStatusUpdate();
    ipcMain.on(FFTChannel.SetFlash, this.changeFlash.bind(this));
    ipcMain.on(FFTChannel.Watch, () => {
      this.updateServerStatus(this.serverStatus, true);
      this.sendStatus();
    });
    this.updateServerStatus('waiting-for-device');
  }

  public async sendStatus() {
    await this.getStatus();
    this.renderer.send(FFTChannel.Status, {
      deviceId: this.id,
      status: this.status,
    });
  }

  public toggleStatusUpdate() {
    if (this.poolingInterval) {
      clearInterval(this.poolingInterval);
      this.poolingInterval = null;
      return;
    }

    this.poolingInterval = setInterval(async () => {
      this.sendStatus();
    }, 10000);

    this.sendStatus();
  }

  public destroy() {
    super.destroy();
    if (this.ffmpeg) this.ffmpeg.kill(0);
    ipcMain.off(FFTChannel.SetFlash, this.changeFlash.bind(this));
    if (this.poolingInterval) clearInterval(this.poolingInterval);
  }

  public startStreaming(): void {
    const params = [
      '-fflags',
      'nobuffer',
      '-flags',
      'low_delay', // LOL
      /* log info to console */
      '-loglevel',
      'quiet',
      '-timeout',
      '10000',
      '-i',
      this.streamUrl,

      '-an',
      '-c:v',
      'mjpeg',
      '-pix_fmt',
      'yuvj422p',
      '-f',
      'mpjpeg',
      '-vf',
      'scale=240:240,transpose=1',
      '-q',
      '1',
      'pipe:1',
    ];

    const p2j = new Pj2();

    p2j.on('jpeg', (jpeg: Buffer) => {
      this.updateServerStatus('streaming');
      this.onJPEGImage(jpeg);
    });

    this.ffmpeg = spawn(BINARIES_PATHS.ffmpeg, params, {
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    this.ffmpeg.on('exit', (code, signal) => {
      this.updateServerStatus('waiting-for-device');
      setTimeout(() => {
        this.startStreaming();
      }, 3000);
    });

    this.ffmpeg.stdout.pipe(p2j);
  }

  public async onJPEGImage(jpeg: Buffer) {
    tf.tidy(() => {
      const grayscale = tf.node
        .decodeJpeg(jpeg)
        .resizeBilinear([224, 224])
        .reshape([224, 224, 3])
        .mean(2);
      const input = tf
        .stack([grayscale, grayscale, grayscale], 2)
        .reshape([3, 224, 224])
        .div(255)
        .toFloat()
        .expandDims(0);
      // console.log(input.dataSync());
      const result = this.model.predict(input) as Tensor;
      const syncResult = result.dataSync();
      this.renderer.send(FFTChannel.NewFrame, {
        deviceId: this.id,
        frame: jpeg,
        blendShapes: syncResult,
      });
      this.currentFrame = jpeg;
      this.newFramesSubject.next(jpeg);
    });
  }

  public async getStatus(): Promise<FaceTrackerStatus> {
    try {
      const data = await fetch(`http://${this.ip}:82/status`).then((res) =>
        res.json()
      );
      this.status = data as FaceTrackerStatus;
    } catch (e) {
      this.status = null;
    }
    return this.status;
  }

  public async changeFlash(
    event: any,
    payload: { deviceId: string; value: number }
  ) {
    if (payload.value === this.status.flash) return;
    const formData = new URLSearchParams();
    formData.append('value', payload.value.toString());

    this.toggleStatusUpdate();
    await fetch(`http://${this.ip}:82/set-flash`, {
      method: 'POST',
      body: formData,
    });
    this.status.flash = payload.value;
    this.renderer.send(FFTChannel.Status, {
      deviceId: this.id,
      status: this.status,
    });
    this.toggleStatusUpdate();
  }

  public updateServerStatus(status: FaceServerStatus, force = false) {
    if (status !== this.serverStatus || force) {
      this.serverStatus = status;
      this.renderer.send(FFTChannel.ServerStatus, {
        status,
      });
    }
  }
}
