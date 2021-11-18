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
    ipcMain.on(FaceTrainerChannel.OpenDataset, async (event, { name }) => {
      if (!name) {
        const { filePaths, canceled } = await dialog.showOpenDialog({
          properties: ['openFile'],
          filters: [{ name: 'Dataset', extensions: ['zip'] }],
        });
        if (canceled) return;

        const [file] = filePaths;
        this.loadDataset(file, event);
      } else {
        const datasetPath = path.join(
          app.getPath('documents'),
          'FuturaServer',
          'datasets',
          `${name}.zip`
        );
        this.loadDataset(datasetPath, event);
      }
    });

    ipcMain.on(FaceTrainerChannel.AskImage, async (event, { index }) => {
      event.sender.send(FaceTrainerChannel.ReceiveImage, {
        image: await this.imagesFiles[index].async('base64'),
      });
      event.sender.send(FaceTrainerChannel.UpdateBlendShapes, {
        blendShapes:
          this.datasetInformations.frames[this.imagesFiles[index].name]
            .blendShapes,
      });
    });

    ipcMain.on(
      FaceTrainerChannel.SetBlendShapes,
      (event, { values, frame }) => {
        this.datasetInformations.frames[
          this.imagesFiles[frame].name
        ].blendShapes = values;
      }
    );

    ipcMain.on(FaceTrainerChannel.SaveDataset, async (event, { name }) => {
      const savedir = path.join(
        app.getPath('documents'),
        'FuturaServer',
        'datasets'
      );
      await fsPromises.mkdir(savedir, { recursive: true });
      const zip = new JSZip();

      await Promise.all(
        this.imagesFiles.map(async (file) => {
          return zip.file(file.name, await file.async('arraybuffer'));
        })
      );
      zip.file('model.json', JSON.stringify(this.datasetInformations, null, 2));

      const outPath = path.join(savedir, `${name}.zip`);
      zip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(outPath))
        .on('finish', () => {
          console.log(`${outPath} writen`);
        });
    });

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

  public loadDataset(file: string, event: IpcMainEvent) {
    fs.readFile(file, async (err, data) => {
      if (err)
        event.sender.send(FaceTrainerChannel.DatasetLoaded, { ok: false });
      const { files } = await JSZip.loadAsync(data);
      this.files = files;
      const imageCount = this.imagesFiles.length;
      const newDataset = !files['model.json'];
      if (!newDataset) {
        this.datasetInformations = JSON.parse(
          await files['model.json'].async('string')
        );
      } else {
        this.datasetInformations = {
          name: `dataset_${Date.now()}`,
          frames: Array.from({ length: imageCount }).reduce<{
            [key: string]: { blendShapes: number[] };
          }>(
            (frames, _, frame) => ({
              ...frames,
              [this.imagesFiles[frame].name]: {
                blendShapes: Array.from({ length: shapeKeys.length }, () => 0),
              },
            }),
            {}
          ),
        };
      }
      event.sender.send(FaceTrainerChannel.DatasetLoaded, {
        ok: true,
        imagesCount: imageCount,
        name: this.datasetInformations.name,
      });
      if (!newDataset) {
        event.sender.send(FaceTrainerChannel.UpdateBlendShapes, {
          blendShapes:
            this.datasetInformations.frames[this.imagesFiles[0].name]
              .blendShapes,
        });
      }
    });
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
