import {
  createContext,
  Reducer,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { useParams } from 'react-router';
import { shapeKeys } from '../../../common-types';
import { FaceTrainerChannel } from '../../../ipcTypes';
import { useNativeAPI } from '../native-api';

export type TrainerAction =
  | {
      type: 'load-dataset';
      imagesCount: number;
      datasetName: string;
      datasetLoaded: boolean;
    }
  | {
      type: 'update-blendshapes';
      blendShapes: number[];
    }
  | {
      type: 'next-picture';
    }
  | {
      type: 'prev-picture';
    }
  | {
      type: 'image-loading';
    }
  | {
      type: 'set-image';
      image: string;
    };

export interface TrainerState {
  datasetLoaded: boolean;
  imagesCount: number;
  currImageIndex: number;
  blendShapes: number[];
  savedDatasets: string[];
  datasetName: string;
  imageLoading: boolean;
  image?: string;
}

export interface FaceTrainerData {
  prevImage: () => void;
  nextImage: () => void;
  save: () => void;
  reset: () => void;
  setBlendShape: (
    key: string
  ) => (event: Event, value: number | number[]) => void;
  state: TrainerState;
}

export const FaceTrainerContext = createContext<FaceTrainerData>(
  undefined as any
);

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case 'load-dataset': {
      return {
        ...state,
        ...action,
      };
    }
    case 'next-picture': {
      return {
        ...state,
        currImageIndex: state.currImageIndex + 1,
      };
    }
    case 'prev-picture': {
      return {
        ...state,
        currImageIndex: state.currImageIndex - 1,
      };
    }
    case 'update-blendshapes': {
      return {
        ...state,
        blendShapes: action.blendShapes,
      };
    }
    case 'image-loading': {
      return {
        ...state,
        imageLoading: true,
      };
    }
    case 'set-image': {
      return {
        ...state,
        imageLoading: false,
        image: action.image,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

export function useProvideFaceTrainer(): FaceTrainerData {
  const nativeAPI = useNativeAPI();
  const { dataset } = useParams<{ dataset: string }>();
  const [state, dispatch] = useReducer<Reducer<TrainerState, TrainerAction>>(
    reducer,
    {
      datasetLoaded: false,
      imagesCount: 0,
      currImageIndex: 0,
      blendShapes: Array.from({ length: shapeKeys.length }, () => 0),
      savedDatasets: [],
      datasetName: 'not-loaded',
      imageLoading: false,
    }
  );

  const loadFiles = (
    event: any,
    {
      imagesCount,
      name,
      ok,
    }: { ok: boolean; imagesCount: number; name: string }
  ) => {
    dispatch({
      type: 'load-dataset',
      imagesCount,
      datasetName: name,
      datasetLoaded: ok,
    });
  };

  const updateBlendShapes = (
    event: any,
    { blendShapes }: { blendShapes: number[] }
  ) => {
    dispatch({ type: 'update-blendshapes', blendShapes });
  };

  const receiveImage = (event: any, payload: { image: string }) => {
    dispatch({
      type: 'set-image',
      image: `data:image/jpg;base64,${payload.image}`,
    });
  };

  useEffect(() => {
    nativeAPI.on(FaceTrainerChannel.DatasetLoaded, loadFiles);
    nativeAPI.on(FaceTrainerChannel.UpdateBlendShapes, updateBlendShapes);
    nativeAPI.on(FaceTrainerChannel.ReceiveImage, receiveImage);

    return () => {
      nativeAPI.removeListener(FaceTrainerChannel.DatasetLoaded, loadFiles);
      nativeAPI.removeListener(
        FaceTrainerChannel.UpdateBlendShapes,
        updateBlendShapes
      );
      nativeAPI.removeListener(FaceTrainerChannel.ReceiveImage, receiveImage);
    };
  }, []);

  useEffect(() => {
    if (!state.datasetLoaded) return;
    nativeAPI.send(FaceTrainerChannel.AskImage, {
      index: state.currImageIndex,
    });
    dispatch({ type: 'image-loading' });
  }, [state.currImageIndex, state.datasetLoaded]);

  useEffect(() => {
    if (!dataset) return;
    nativeAPI.send(FaceTrainerChannel.OpenDataset, {
      name: dataset === 'new' ? undefined : dataset,
    });
  }, [dataset]);

  return {
    state,
    nextImage: () => dispatch({ type: 'next-picture' }),
    prevImage: () => dispatch({ type: 'prev-picture' }),
    setBlendShape:
      (name: string) => (event: Event, value: number | number[]) => {
        const val = value as number;
        const shapes = [...state.blendShapes];
        shapes[shapeKeys.indexOf(name)] = val;
        dispatch({ type: 'update-blendshapes', blendShapes: shapes });
        nativeAPI.send(FaceTrainerChannel.SetBlendShapes, {
          values: shapes,
          frame: state.currImageIndex,
        });
      },
    reset: () => {
      const shapes = Array.from({ length: state.blendShapes.length }, () => 0);
      dispatch({
        type: 'update-blendshapes',
        blendShapes: shapes,
      });
      nativeAPI.send(FaceTrainerChannel.SetBlendShapes, {
        values: shapes,
        frame: state.currImageIndex,
      });
    },
    save: () => {
      nativeAPI.send(FaceTrainerChannel.SaveDataset, {
        name: state.datasetName,
      });
    },
  };
}

export function useFaceTrainer(): FaceTrainerData {
  const context = useContext<FaceTrainerData>(FaceTrainerContext);
  if (context === undefined) {
    throw new Error('useFaceTrainer must be used within a FaceTrainerProvider');
  }
  return context;
}
