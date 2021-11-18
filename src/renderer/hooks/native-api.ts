import * as electron from 'electron';
import { IpcChannelMap } from '../../ipcTypes';

interface StrictChannelMap {
  [k: string]: any;
}
declare type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
declare type IntersectMethodSignatures<S> = UnionToIntersection<S[keyof S]>;
type SendMethodSignatures<ChannelMap extends StrictChannelMap> =
  IntersectMethodSignatures<{
    [C in keyof ChannelMap]: ChannelMap[C] extends void
      ? (channel: C) => void
      : (channel: C, payload: ChannelMap[C]) => void;
  }>;
declare type ListenerRegistrarSignatures<ChannelMap extends StrictChannelMap> =
  IntersectMethodSignatures<{
    [C in keyof ChannelMap]: (
      channel: C,
      listener: ChannelMap[C] extends void
        ? (event: electron.Event) => void
        : (event: electron.Event, payload: ChannelMap[C]) => void
    ) => void;
  }>;

type NativeAPI = {
  send: SendMethodSignatures<IpcChannelMap>;
  on: ListenerRegistrarSignatures<IpcChannelMap>;
  removeListener: ListenerRegistrarSignatures<IpcChannelMap>;
};

export function useNativeAPI(): NativeAPI {
  const { send, on, removeListener } = (window as any).nativeAPI as NativeAPI;

  return {
    send,
    on,
    removeListener,
  };
}
