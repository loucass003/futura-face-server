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
      record: string;
      index: number;
    }
  | {
      type: 'delete-picture';
      index: number;
    }
  | {
      type: 'recording';
    };

export interface TrainerState {
  name: string;
  blendshapes: Record<string, IBlendshape>;
  currentRecord: string;
  currentBlendshapeIndex: number;
  datasetLoading: boolean;
  imageLoading: boolean;
  recording: boolean;
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
  currentBlendshape?: IBlendshape;
  blendshapesCount: number;
  state: TrainerState;
}

export const FaceTrainerContext = createContext<FaceTrainerData>(
  undefined as any
);

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case 'open-dataset': {
      return {
        ...state,
        ...(action.dataset || {}),
        name: action.name,
        datasetLoading: false,
        imageLoading: !!action.dataset, // IF we have a dataset we wait for the first image to load, so this needs to be true
        currentBlendshapeIndex: 0,
      };
    }
    case 'add-blendshape': {
      const len = Object.keys(state.blendshapes).length;
      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`records/${len}`]: {
            recordExists: false,
            keys: randomFaceShape(),
          },
        },
        currentBlendshapeIndex: len,
      };
    }
    case 'delete-blendshape': {
      // const blendshapes = [...state.blendshapes];
      // blendshapes.splice(state.currentBlendshapeIndex, 1);
      delete state.blendshapes[`records/${state.currentBlendshapeIndex}`];

      return {
        ...state,
        currentBlendshapeIndex: Math.max(0, state.currentBlendshapeIndex - 1),
      };
    }
    case 'random-blendshape': {
      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`records/${state.currentBlendshapeIndex}`]: {
            ...state.blendshapes[`records/${state.currentBlendshapeIndex}`],
            keys: randomFaceShape(),
          },
        },
      };
    }
    case 'take-picture': {
      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`records/${action.index}`]: {
            ...state.blendshapes[`records/${action.index}`],
            recordExists: !!action.record,
          },
        },
        currentRecord: action.record,
        imageLoading: false,
        recording: false,
      };
    }
    case 'delete-picture': {
      // const blendshapes = [...state.blendshapes];

      // blendshapes[action.index] = {
      //   ...blendshapes[action.index],
      //   imageData: null,
      //   imageExists: false,
      // };

      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`records/${action.index}`]: {
            ...state.blendshapes[`records/${action.index}`],
            recordExists: false,
          },
        },
      };
    }
    case 'next-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex + 1,
        imageLoading: true,
      };
    }
    case 'prev-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex - 1,
        imageLoading: true,
      };
    }
    case 'recording': {
      return {
        ...state,
        recording: true,
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
      blendshapes: {
        [`records/0`]: { keys: randomFaceShape(), recordExists: false },
      },
      currentRecord: null,
      datasetLoading: true,
      imageLoading: true,
      recording: false,
    } as TrainerState
  );

  const onReceiveRecord = (event, { index, record }) => {
    const blob = new Blob([record]);
    const url = URL.createObjectURL(blob);

    dispatch({
      type: 'take-picture',
      record: url,
      index,
    });
  };

  const askRecord = (dataset: string, index: number) => {
    nativeAPI.send(FaceTrainerChannel.AskRecord, {
      dataset,
      index,
    });
  };

  const deleteRecord = (dataset: string, index: number) => {
    nativeAPI.send(FaceTrainerChannel.DeleteRecord, {
      name: dataset,
      index,
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
      deleteRecord(state.name, state.currentBlendshapeIndex);
      dispatch({ type: 'delete-blendshape' });
    },
    deleteRecord: () => {
      dispatch({
        type: 'delete-picture',
        index: state.currentBlendshapeIndex,
      });
      deleteRecord(state.name, state.currentBlendshapeIndex);
    },
    randomBlendshape: () => {
      if (
        state.blendshapes[`records/${state.currentBlendshapeIndex}`]
          .recordExists
      ) {
        deleteRecord(state.name, state.currentBlendshapeIndex);
        dispatch({
          type: 'delete-picture',
          index: state.currentBlendshapeIndex,
        });
      }
      dispatch({
        type: 'random-blendshape',
      });
    },
    takeRecord: () => {
      dispatch({
        type: 'recording',
      });
      nativeAPI.send(FaceTrainerChannel.RecordPose, {
        dataset: state.name,
        index: state.currentBlendshapeIndex,
        shapesCount: Object.keys(state.blendshapes).length,
        blendshapes:
          state.blendshapes[`records/${state.currentBlendshapeIndex}`].keys,
      });
    },
    save: () => {},
    currentBlendshape:
      state.blendshapes[`records/${state.currentBlendshapeIndex}`],
    blendshapesCount: Object.keys(state.blendshapes).length,
  };
}

export function useFaceTrainer(): FaceTrainerData {
  const context = useContext<FaceTrainerData>(FaceTrainerContext);
  if (context === undefined) {
    throw new Error('useFaceTrainer must be used within a FaceTrainerProvider');
  }
  return context;
}
