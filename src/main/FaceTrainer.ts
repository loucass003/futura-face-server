import { ipcMain, app, WebContents } from 'electron';
import JSZip from 'jszip';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { Subscription } from 'rxjs';
import { FaceTrainerChannel } from '../ipcTypes';
import { DevicesServer } from './DevicesServer';

export class FaceTrainer {
  private recordedFrames: Buffer[];

  private renderer: WebContents;

  private recordingSubscription: Subscription;

  private FRAMES_PER_BLENDSHAPES = 50;

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
        this.recordingSubscription = this.devicesServer
          .getDefaultFaceTraker()
          .newFramesSubject.subscribe(async (frame) => {
            this.recordedFrames.push(frame);
            if (this.recordedFrames.length === this.FRAMES_PER_BLENDSHAPES) {
              this.unsubscribeRecording();
              const datasetPath = this.getDatasetPath(dataset);
              const data = await fsPromises.readFile(datasetPath);
              const zip = await JSZip.loadAsync(data);
              const model = zip.files['model.json']
                ? JSON.parse(await zip.file('model.json').async('string'))
                : { blendshapes: {} };
              model.blendshapes[`images/${index}`] = { shape: blendshapes };
              zip.file('model.json', JSON.stringify(model, null, 2));
              this.recordedFrames.forEach((frame, imageIndex) => {
                zip.file(`images/${index}/${imageIndex}.jpg`, frame);
              });
              await this.saveZip(datasetPath, zip);
              event.sender.send(FaceTrainerChannel.ReceiveRecord, {
                index,
                frames: this.recordedFrames.map((frame) =>
                  frame.toString('base64')
                ),
              });
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
        let frames = null;

        if (zip.files[`images/${index}/0.jpg`])
          frames = await Promise.all(
            Array.from({ length: this.FRAMES_PER_BLENDSHAPES }).map(
              (_, imageIndex) =>
                zip.file(`images/${index}/${imageIndex}.jpg`).async('base64')
            )
          );
        else {
          frames = null;
        }

        event.sender.send(FaceTrainerChannel.ReceiveRecord, {
          index,
          frames,
        });
      }
    );

    ipcMain.on(
      FaceTrainerChannel.DeleteRecord,
      async (event, { name, index }) => {
        const datasetPath = this.getDatasetPath(name);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);

        Array.from({ length: this.FRAMES_PER_BLENDSHAPES }).forEach(
          (_, imageIndex) => {
            const imagePath = `images/${index}/${imageIndex}.jpg`;
            if (zip.files[imagePath]) zip.remove(imagePath);
          }
        );

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
          recordExists: !!zip.files[`images/${curr}/0.jpg`],
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
