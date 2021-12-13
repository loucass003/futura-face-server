import { ipcMain, dialog, app, IpcMainEvent } from 'electron';
import JSZip from 'jszip';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { shapeKeys } from '../common-types';
import { FaceTrainerChannel } from '../ipcTypes';

export class FaceTrainer {
  private files: { [file: string]: JSZip.JSZipObject } = {};

  private datasetInformations!: {
    name: string;
    frames: { [key: string]: { blendShapes: number[] } };
  };

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
        const datasetPath = path.join(
          app.getPath('documents'),
          'FuturaServer',
          'datasets',
          `${name}.zip`
        );

        await fsPromises.rm(datasetPath);
        const datasets = await this.getSavedDatasets();
        event.sender.send(FaceTrainerChannel.SavedDatasets, {
          datasets_names: datasets,
        });
      }
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

  get imagesFiles() {
    return Object.values(this.files).filter(({ name }) => name.match(/\.jpg/g));
  }
}
