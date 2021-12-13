import Pj2 from 'pipe2jpeg';
import { spawn, ChildProcessByStdio } from 'child_process';
import { WebContents, ipcMain, app, IpcMainEvent } from 'electron';
import fetch from 'node-fetch';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { URLSearchParams } from 'url';
import * as tf from '@tensorflow/tfjs-node';
import { TFSavedModel } from '@tensorflow/tfjs-node/dist/saved_model';
import { Tensor } from '@tensorflow/tfjs-node';
import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { shapeKeys } from '../common-types';
import {
  FaceRecorderChannel,
  FaceServerStatus,
  FaceTrackerStatus,
  FFTChannel,
} from '../ipcTypes';
import { Device } from './Device';

export class FuturaFaceTracker extends Device {
  public status!: FaceTrackerStatus;

  public serverStatus: FaceServerStatus = 'waiting-for-device';

  public ffmpeg?: ChildProcessByStdio<null, any, null>;

  private poolingInterval!: NodeJS.Timer;

  // private recordEndTimout!: NodeJS.Timeout;

  public record: string = null;

  public currFrame = 0;

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
    // ipcMain.on(FaceRecorderChannel.StartRecording, async (event) => {
    //   event.sender.send(FaceRecorderChannel.RecordingStatus, {
    //     status: 'recording',
    //   });
    //   this.record = `futura_server_face_record_${Date.now()}`;
    //   const recordFolder = path.join(app.getPath('temp'), this.record);
    //   await fsPromises.mkdir(recordFolder);
    //   this.recordEndTimout = setTimeout(async () => {
    //     this.record = null;
    //     this.createDatasetFromRecord(event, recordFolder);
    //   }, 30000);
    // });
    // ipcMain.on(FaceRecorderChannel.CancelRecording, () => {
    //   this.record = null;
    //   if (this.recordEndTimout) {
    //     clearTimeout(this.recordEndTimout);
    //     this.recordEndTimout = null;
    //   }
    // });
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
      '2000',
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
      'fps=30,scale=240:240,transpose=1',
      '-q',
      '1',
      'pipe:1',
    ];

    const p2j = new Pj2();

    p2j.on('jpeg', (jpeg: Buffer) => {
      this.updateServerStatus('streaming');
      this.onJPEGImage(jpeg);
    });

    this.ffmpeg = spawn(ffmpegInstaller.path, params, {
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
        .resizeBilinear([128, 128])
        .reshape([128, 128, 3])
        .mean(2)
        .div(255)
        .toFloat()
        .expandDims(0)
        .expandDims(-1);
      const result = this.model.predict(grayscale) as Tensor;
      const syncResult = result.dataSync();
      this.renderer.send(FFTChannel.NewFrame, {
        deviceId: this.id,
        frame: jpeg,
        blendShapes: syncResult,
      });
    });

    // if (this.record) {
    //   if (this.currFrame % 10 === 0) {
    //     const stream = fs.createWriteStream(
    //       path.join(
    //         app.getPath('temp'),
    //         this.record,
    //         `img-${this.currFrame}.jpg`
    //       )
    //     );
    //     stream.once('open', () => {
    //       stream.write(jpeg);
    //       stream.end();
    //     });
    //   }
    //   this.currFrame += 1;
    // }
  }

  public async getStatus(): Promise<FaceTrackerStatus> {
    const data = await fetch(`http://${this.ip}:82/status`).then((res) =>
      res.json()
    );
    this.status = data as FaceTrackerStatus;
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

  // public async createDatasetFromRecord(
  //   event: IpcMainEvent,
  //   recordFolder: string
  // ) {
  //   event.sender.send(FaceRecorderChannel.RecordingStatus, {
  //     status: 'removing-duplicates',
  //   });
  //   // await removeDuplicates(recordFolder, {
  //   //   threshold: 0.9,
  //   //   tolerance: 0,
  //   // });

  //   event.sender.send(FaceRecorderChannel.RecordingStatus, {
  //     status: 'compressing',
  //   });
  //   const zip = new JSZip();

  //   const datasetName = `recorded_dataset_${Date.now()}`;

  //   const files = await fsPromises.readdir(recordFolder);
  //   if (!files || files.length === 0) {
  //     throw new Error('No files in the directory');
  //   }
  //   const images = files.filter((name) => name.match(/.jpg/g));

  //   images.map((image) =>
  //     zip.file(image, fs.createReadStream(path.join(recordFolder, image)))
  //   );
  //   zip.file(
  //     'model.json',
  //     JSON.stringify(
  //       {
  //         name: datasetName,
  //         frames: Array.from({ length: images.length }).reduce<{
  //           [key: string]: { blendShapes: number[] };
  //         }>(
  //           (frames, _, frame) => ({
  //             ...frames,
  //             [images[frame]]: {
  //               blendShapes: Array.from({ length: shapeKeys.length }, () => 0),
  //             },
  //           }),
  //           {}
  //         ),
  //       },
  //       null,
  //       2
  //     )
  //   );

  //   const datasetPath = path.join(
  //     app.getPath('documents'),
  //     'FuturaServer',
  //     'datasets',
  //     `${datasetName}.zip`
  //   );

  //   zip
  //     .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  //     .pipe(fs.createWriteStream(datasetPath))
  //     .on('finish', () => {
  //       event.sender.send(FaceRecorderChannel.RecordingStatus, {
  //         status: 'done',
  //       });
  //     });
  // }

  public updateServerStatus(status: FaceServerStatus, force = false) {
    if (status !== this.serverStatus || force) {
      this.serverStatus = status;
      this.renderer.send(FFTChannel.ServerStatus, {
        status,
      });
    }
  }
}
