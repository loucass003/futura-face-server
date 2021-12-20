import { ipcMain, app } from 'electron';
import JSZip from 'jszip';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { FaceTrainerChannel } from '../ipcTypes';
import { DevicesServer } from './DevicesServer';

export class FaceTrainer {
  constructor(private devicesServer: DevicesServer) {}

  public init() {
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
      FaceTrainerChannel.TakePicture,
      async (event, { dataset, index, blendshapes }) => {
        const currentFrame =
          this.devicesServer.getDefaultFaceTraker().currentFrame;

        const datasetPath = this.getDatasetPath(dataset);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);

        const model = zip.files['model.json']
          ? JSON.parse(await zip.file('model.json').async('string'))
          : { blendshapes: {} };

        const imageFile = `images/${index}.jpg`;
        model.blendshapes[imageFile] = { shape: blendshapes };
        zip.file('model.json', JSON.stringify(model, null, 2));
        zip.file(imageFile, currentFrame);
        await this.saveZip(datasetPath, zip);
        event.sender.send(FaceTrainerChannel.ReceiveTookPicture, {
          index,
          image: currentFrame.toString('base64'),
        });
      }
    );

    ipcMain.on(FaceTrainerChannel.OpenDataset, async (event, { name }) => {
      const dataset = await this.openDataset(name);
      event.sender.send(FaceTrainerChannel.ReceiveDataset, { name, dataset });
    });

    ipcMain.on(
      FaceTrainerChannel.AskPicture,
      async (event, { dataset, index }) => {
        const datasetPath = this.getDatasetPath(dataset);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);
        let imageData = null;
        const imagePath = `images/${index}.jpg`;
        if (zip.files[imagePath])
          imageData = await zip.file(imagePath).async('base64');
        event.sender.send(FaceTrainerChannel.ReceiveTookPicture, {
          index,
          image: imageData,
        });
      }
    );

    ipcMain.on(
      FaceTrainerChannel.DeletePicture,
      async (event, { name, index }) => {
        const datasetPath = this.getDatasetPath(name);
        const data = await fsPromises.readFile(datasetPath);
        const zip = await JSZip.loadAsync(data);
        const imagePath = `images/${index}.jpg`;
        if (zip.files[imagePath]) await zip.remove(imagePath);
        await this.saveZip(datasetPath, zip);
      }
    );
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
    // const blendshapes = await Promise.all(
    //   Object.keys(model.blendshapes).map(async (key: string, index) => {
    //     return {
    //       keys: model.blendshapes[key].shape,
    //       imageData:
    //         index === 0 && zip.files[key]
    //           ? `data:image/jpg;base64,${await zip.file(key).async('base64')}`
    //           : null,
    //       imageExists: !!zip.files[key],
    //     };
    //   })
    // );

    const blendshapes = Object.keys(model.blendshapes).reduce((out, curr) => {
      return {
        ...out,
        [curr]: {
          keys: model.blendshapes[curr].shape,
          imageData: null,
          imageExists: !!zip.files[curr],
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

  public getDatasetPath(name: string) {
    return path.join(
      app.getPath('documents'),
      'FuturaServer',
      'datasets',
      `${name}.zip`
    );
  }

  public async getSavedDatasets(): Promise<string[]> {
    const savedir = path.join(
      app.getPath('documents'),
      'FuturaServer',
      'datasets'
    );
    const files = await fsPromises.readdir(savedir);
    return files
      .filter((name) => name.match(/.zip/g))
      .map((name) => name.substr(0, name.length - 4));
  }
}
