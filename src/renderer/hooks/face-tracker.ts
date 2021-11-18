import {
  createContext,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router';
import debounce from 'lodash.debounce';
import {
  FaceServerStatus,
  FaceTrackerStatus,
  FFTChannel,
  FFTNewFrame,
} from '../../ipcTypes';
import { useFuturaDevices } from './devices';
import { useNativeAPI } from './native-api';

export const FaceTrackerContext = createContext<FaceTracker>(undefined as any);

export interface FaceTracker {
  device: IDevice;
  status?: FaceTrackerStatus;
  serverStatus: FaceServerStatus;
  canvas: Ref<any>;
  flash: number;
  blendShapes: number[];
  changeFlash: (event: any) => void;
  setPredictions: (value: boolean) => void;
}

export function useProvideFaceTracker(): FaceTracker {
  const { id } = useParams<{ id: string }>();
  const { state } = useFuturaDevices();
  const nativeAPI = useNativeAPI();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<FaceTrackerStatus>();
  const [serverStatus, setServerStatus] =
    useState<FaceServerStatus>('waiting-for-device');
  const [flash, setFlash] = useState(0);
  const [predictions, setPredictions] = useState<boolean>(true);
  const [blendShapes, setBlendShapes] = useState<number[]>();

  const drawFrame = (event: any, data: FFTNewFrame) => {
    // TODO There is a memory leak here, need to fix that a some point
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');

    setBlendShapes(data.blendShapes);

    if (!ctx) return;
    let blob = new Blob([data.frame]);
    let image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => {
      const clear = () => {
        URL.revokeObjectURL(image.src);
        image.onload = null;
        image.onerror = null;
        image = null;
        blob = null;
      };

      if (!canvasRef.current) {
        clear();
        return;
      }
      ctx.drawImage(image, 0, 0, 128, 128);
      // if (predictions) {
      //   data.points.forEach(({ x, y }) => {
      //     ctx.beginPath();
      //     ctx.fillStyle = 'red';
      //     ctx.arc(x, y, 2, 0, 2 * Math.PI);
      //     ctx.fill();
      //   });
      // }
      clear();
    };
    image.onerror = (error) => console.log(error);
  };

  const updateStatus = (
    event: any,
    payload: { deviceId: string; status: FaceTrackerStatus }
  ) => {
    if (payload.deviceId === id) {
      setStatus(payload.status);
      setFlash(payload.status.flash);
    }
  };

  const sendFlash = (value: number) => {
    nativeAPI.send(FFTChannel.SetFlash, { deviceId: id, value });
  };
  const delayedChangeFlash = useCallback(debounce(sendFlash, 500), [sendFlash]);

  useEffect(() => {
    if (status) delayedChangeFlash(flash);
    return () => {
      if (status) delayedChangeFlash.cancel();
    };
  }, [flash]);

  const changeFlash = (event: any) => {
    if (status) {
      // Do not update the flashlight until i got a status from the device
      setFlash(event.target.value);
    }
  };

  const updateServerStatus = (
    event,
    { status }: { status: FaceServerStatus }
  ) => {
    setServerStatus(status);
  };

  useEffect(() => {
    canvasRef.current.width = 128;
    canvasRef.current.height = 128;
    nativeAPI.send(FFTChannel.Watch);
    nativeAPI.on(FFTChannel.NewFrame, drawFrame);
    nativeAPI.on(FFTChannel.Status, updateStatus);
    nativeAPI.on(FFTChannel.ServerStatus, updateServerStatus);

    return () => {
      nativeAPI.removeListener(FFTChannel.NewFrame, drawFrame);
      nativeAPI.removeListener(FFTChannel.Status, updateStatus);
      nativeAPI.removeListener(FFTChannel.ServerStatus, updateServerStatus);
    };
  }, [predictions]);

  return {
    device: state.devices[id],
    status,
    serverStatus,
    flash,
    canvas: canvasRef,
    blendShapes,
    changeFlash,
    setPredictions,
  };
}

export function useFaceTracker(): FaceTracker {
  const context = useContext<FaceTracker>(FaceTrackerContext);
  if (context === undefined) {
    throw new Error('useFaceTracker must be used within a FaceTrackerProvider');
  }
  return context;
}
