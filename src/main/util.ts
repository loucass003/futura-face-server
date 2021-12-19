/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import path from 'path';
import { spawn, exec } from 'child_process';
import { BINARIES_PATHS } from './binaries';

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

export function getSerialPorts() {
  // Works only on windows
  return new Promise((resolve) => {
    exec('mode', (err, stdout, stderr) => {
      resolve(
        (stdout.match(/Status for device (COM\d+)/g) || []).map((str) =>
          str.replace(/Status for device /gi, '')
        )
      );
    });
  });
}
