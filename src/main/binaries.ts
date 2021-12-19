import path from 'path';
import { rootPath as root } from 'electron-root-path';
import { isPackaged } from 'electron-is-packaged';
import { getPlatform } from './platform';

const IS_PROD = process.env.NODE_ENV === 'production';

const binariesPath = path.join(root, './resources', getPlatform(), './bin');

export const BINARIES_PATHS = {
  esptool: path.join(binariesPath, './esptool.exe'),
};

const firmwarePath =
  isPackaged && IS_PROD
    ? path.join(root, './resources/assets/firmwares')
    : path.join(root, './assets/firmwares');

export const FIRMWARES_PATHS = {
  FuturaFaceTracker: {
    firmware: path.join(firmwarePath, 'futura-face-tracker', 'firmware.bin'),
    partitions: path.join(
      firmwarePath,
      'futura-face-tracker',
      'partitions.bin'
    ),
  },
  espressif: {
    boot: path.join(firmwarePath, 'boot_app0.bin'),
    bootloader: path.join(firmwarePath, 'bootloader_dio_40m.bin'),
  },
};

const modelsPath =
  isPackaged && IS_PROD
    ? path.join(root, './resources/assets/models')
    : path.join(root, './assets/models');

export const MODELS_PATHS = {
  FuturaFaceTracker: path.join(
    modelsPath,
    'futura-face-tracker',
    'face-tracker-model'
  ),
};
