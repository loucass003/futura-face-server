import { ipcMain, app, WebContents } from 'electron';
import JSZip from 'jszip';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { Subscription } from 'rxjs';
import { spawn } from 'child_process';
import { BINARIES_PATHS } from './binaries';
import { FaceTrainerChannel } from '../ipcTypes';
import { DevicesServer } from './DevicesServer';

export class FaceTrainer {
  private recordedFrames: number = 0;

  private renderer: WebContents;

  private recordingSubscription: Subscription;

  private FRAMES_PER_BLENDSHAPES = 120;

  constructor(private devicesServer: DevicesServer) {}

  public init(renderer: WebContents) {
    this.renderer = renderer;
    ipcMain.on(FaceTrainerChannel.AskSavedDatasets, async (event) => {
      const datasets = await this.getSavedDatasets();
      event.sender.send(FaceTrainerChannel.SavedDatasets, {
        datasets_names: datasets,
      });
    });

    ipcMain.on(
      FaceTrainerChannel.DeleteDataset,
      async (event, { name }: { name: string }) => {
        const datasetPath = this.getDatasetPath(name);
        await fsPromises.rm(datasetPath);
        const datasets = await this.getSavedDatasets();
        event.sender.send(FaceTrainerChannel.SavedDatasets, {
          datasets_names: datasets,
        });
      }
    );

    ipcMain.on(
      FaceTrainerChannel.RecordPose,
      async (event, { dataset, index, blendshapes }) => {
        const recordTmpFile = path.join(
          app.getPath('temp'),
          `dataset-${dataset}-record-${index}.mp4`
        );

        const params = [
          '-r',
          '60',
          '-framerate',
          '60',
          '-f',
          'image2pipe',
          '-s',
          `240x240`,
          '-i',
          '-',
          '-vcodec',
          'libx264',

          '-pix_fmt',
          'yuv420p',
          '-profile:v',
          'high444',
          '-crf',
          '3',
          '-r',
          '60',
          '-vsync',
          '0',
          recordTmpFile,
        ];

        const ffmpeg = spawn(BINARIES_PATHS.ffmpeg, params);

        ffmpeg.on('exit', async () => {
          const datasetPath = this.getDatasetPath(dataset);
          const data = await fsPromises.readFile(datasetPath);
          const zip = await JSZip.loadAsync(data);
          const model = zip.files['model.json']
            ? JSON.parse(await zip.file('model.json').async('string'))
            : { blendshapes: {}, version: '0.0.1' };
          model.blendshapes[`records/${index}`] = { shape: blendshapes };
          zip.file('model.json', JSON.stringify(model, null, 2));
          const record = await fsPromises.readFile(recordTmpFile);
          zip.file(`records/${index}.mp4`, record);

          await this.saveZip(datasetPath, zip);

          event.sender.send(FaceTrainerChannel.ReceiveRecord, {
            index,
            record,
          });
          await fsPromises.rm(recordTmpFile);
        });

        let done = false;

        this.recordingSubscription = this.devicesServer
          .getDefaultFaceTraker()
          .newFramesSubject.subscribe((frame) => {
            if (done) return;

            if (this.recordedFrames >= this.FRAMES_PER_BLENDSHAPES) {
              this.unsubscribeRecording();
              ffmpeg.stdin.end();
              this.recordedFrames = 0;
              done = true;
            } else {
              ffmpeg.stdin.write(frame);
              this.recordedFrames += 1;
            }
          });
      }
    );

    ipcMain.on(FaceTrainerChannel.OpenDataset, async (event, { name }) => {
      const dataset = await this.openDataset(name);
      event.sender.send(FaceTrainerChannel.ReceiveDataset, { name, dataset });
    });

    ipcMain.on(
      FaceTrainerChannel.AskRecord,
      async (event, { dataset, index }) => {
        const datasetPath = this.getDatasetPath(dataset);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);
        let record = null;

        if (zip.files[`records/${index}.mp4`])
          record = await zip.file(`records/${index}.mp4`).async('nodebuffer');
        else {
          record = null;
        }

        event.sender.send(FaceTrainerChannel.ReceiveRecord, {
          index,
          record,
        });
      }
    );

    ipcMain.on(
      FaceTrainerChannel.DeleteRecord,
      async (event, { name, index }) => {
        const datasetPath = this.getDatasetPath(name);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);

        const recordPath = `records/${index}.mp4`;
        if (zip.files[recordPath]) zip.remove(recordPath);

        await this.saveZip(datasetPath, zip);
      }
    );
  }

  private unsubscribeRecording() {
    if (this.recordingSubscription) {
      this.recordingSubscription.unsubscribe();
    }
  }

  private async openDataset(name: string): Promise<IDataset> {
    const datasetPath = this.getDatasetPath(name);

    try {
      await fsPromises.stat(datasetPath);
    } catch (e) {
      // CREATE FILE IF NOT EXISTS
      const zip = new JSZip();
      await this.saveZip(datasetPath, zip);
      return null;
    }

    const data = await fsPromises.readFile(datasetPath);
    const zip = await JSZip.loadAsync(data);
    const model = JSON.parse(await zip.file('model.json').async('string'));

    const blendshapes = Object.keys(model.blendshapes).reduce((out, curr) => {
      return {
        ...out,
        [curr]: {
          keys: model.blendshapes[curr].shape,
          record: null,
          recordExists: !!zip.files[`records/${curr}.mp4`],
        },
      };
    }, {});

    return { blendshapes };
  }

  private async saveZip(path: string, zip: JSZip): Promise<boolean> {
    return new Promise((resolve) => {
      zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(path))
        .on('finish', () => {
          resolve(true);
        });
    });
  }

  public getDatasetsPath() {
    return path.join(app.getPath('documents'), 'FuturaServer', 'datasets');
  }

  public getDatasetPath(name: string) {
    return path.join(this.getDatasetsPath(), `${name}.zip`);
  }

  public async getSavedDatasets(): Promise<string[]> {
    const savedir = this.getDatasetsPath();
    try {
      const files = await fsPromises.readdir(savedir);
      return files
        .filter((name) => name.match(/.zip/g))
        .map((name) => name.substr(0, name.length - 4));
    } catch {
      return [];
    }
  }
}
