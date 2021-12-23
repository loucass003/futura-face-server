import {
  createContext,
  Reducer,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import { useParams } from 'react-router';
import { FaceTrainerChannel } from '../../../ipcTypes';
import { useNativeAPI } from '../native-api';
import { randomFaceShape } from './face-shape';

export type TrainerAction =
  | {
      type: 'open-dataset';
      name: string;
      dataset?: IDataset;
    }
  | {
      type: 'random-blendshape';
    }
  | {
      type: 'add-blendshape';
    }
  | {
      type: 'delete-blendshape';
    }
  | {
      type: 'next-blendshape';
    }
  | {
      type: 'prev-blendshape';
    }
  | {
      type: 'take-picture';
      image: string;
      index: number;
    }
  | {
      type: 'delete-picture';
      index: number;
    };

export interface TrainerState {
  name: string;
  blendshapesCount: number;
  currentBlendshape: number[];
  currentBlendshapeIndex: number;
  currentRecord: string[];
  datasetLoading: boolean;
  recordLoading: boolean;
}

export interface FaceTrainerData {
  addBlendshape: () => void;
  takeRecord: () => void;
  randomBlendshape: () => void;
  deleteRecord: () => void;
  deleteBlendshape: () => void;
  prevBlendshape: () => void;
  nextBlendshape: () => void;
  save: () => void;
  state: TrainerState;
}

export const FaceTrainerContext = createContext<FaceTrainerData>(
  undefined as any
);

function createNewBlendShape() {
  return { keys: randomFaceShape(), imageData: null, imageExists: false };
}

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case 'open-dataset': {
      return {
        ...state,
        ...(action.dataset || {}),
        name: action.name,
        datasetLoading: false,
        recordLoading: !!action.dataset, // IF we have a dataset we wait for the first image to load, so this needs to be true
        currentBlendshapeIndex: 0,
      };
    }
    case 'add-blendshape': {
      return state;
    }
    case 'delete-blendshape': {
      return state;
    }
    case 'random-blendshape': {
      return state;
    }
    case 'take-picture': {
      return state;
    }
    case 'delete-picture': {
      return state;
    }
    case 'next-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex + 1,
        recordLoading: true,
      };
    }
    case 'prev-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex - 1,
        recordLoading: true,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

export function useProvideFaceTrainer(): FaceTrainerData {
  const nativeAPI = useNativeAPI();
  // const {} = useFaceTracker();
  const { dataset } = useParams<{ dataset: string }>();
  const [state, dispatch] = useReducer<Reducer<TrainerState, TrainerAction>>(
    reducer,
    {
      name: null,
      currentBlendshapeIndex: 0,
      datasetLoading: true,
      recordLoading: true,
    } as TrainerState
  );

  const onReceiveRecord = (event, { index, images }) => {
    // dispatch({
    //   type: 'take-picture',
    //   image: (image && `data:image/jpg;base64,${image}`) || null,
    //   index,
    // });
  };

  const askRecord = (dataset: string, index: number) => {
    nativeAPI.send(FaceTrainerChannel.AskRecord, {
      dataset,
      index,
    });
  };

  const deletePicture = (dataset: string, index: number) => {
    nativeAPI.send(FaceTrainerChannel.DeletePicture, {
      name: state.name,
      index: state.currentBlendshapeIndex,
    });
  };

  const onReceiveDataset = (event, { name, dataset }) => {
    dispatch({ type: 'open-dataset', name, dataset });

    if (dataset) {
      askRecord(name, state.currentBlendshapeIndex);
    }
  };

  useLayoutEffect(() => {
    const name = dataset || `recorded_dataset_${Date.now()}`;
    nativeAPI.send(FaceTrainerChannel.OpenDataset, { name });
  }, []);

  useEffect(() => {
    nativeAPI.on(FaceTrainerChannel.ReceiveRecord, onReceiveRecord);
    nativeAPI.on(FaceTrainerChannel.ReceiveDataset, onReceiveDataset);

    return () => {
      nativeAPI.removeListener(
        FaceTrainerChannel.ReceiveRecord,
        onReceiveRecord
      );
      nativeAPI.removeListener(
        FaceTrainerChannel.ReceiveDataset,
        onReceiveDataset
      );
    };
  }, []);

  return {
    state,
    prevBlendshape: () => {
      askRecord(state.name, state.currentBlendshapeIndex - 1);
      dispatch({ type: 'prev-blendshape' });
    },
    nextBlendshape: () => {
      askRecord(state.name, state.currentBlendshapeIndex + 1);
      dispatch({ type: 'next-blendshape' });
    },
    addBlendshape: () => {
      dispatch({ type: 'add-blendshape' });
    },
    deleteBlendshape: () => {
      deletePicture(state.name, state.currentBlendshapeIndex);
      dispatch({ type: 'delete-blendshape' });
    },
    deleteRecord: () => {
      dispatch({
        type: 'delete-picture',
        index: state.currentBlendshapeIndex,
      });
      deletePicture(state.name, state.currentBlendshapeIndex);
    },
    randomBlendshape: () => {
      dispatch({
        type: 'random-blendshape',
      });
    },
    takeRecord: () => {
      nativeAPI.send(FaceTrainerChannel.RecordPose, {
        dataset: state.name,
        index: state.currentBlendshapeIndex,
        shapesCount: state.blendshapesCount,
        blendshapes: state.currentBlendshape,
      });
    },
    save: () => {},
  };
}

export function useFaceTrainer(): FaceTrainerData {
  const context = useContext<FaceTrainerData>(FaceTrainerContext);
  if (context === undefined) {
    throw new Error('useFaceTrainer must be used within a FaceTrainerProvider');
  }
  return context;
}
