import {
  createContext,
  Reducer,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import { useParams } from 'react-router';
import { shapeKeys } from '../../../common-types';
import { FaceTrainerChannel } from '../../../ipcTypes';
import { useFaceTracker } from '../face-tracker';
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
  blendshapes: Record<string, IBlendshape>;
  currentBlendshapeIndex: number;
  datasetLoading: boolean;
  imageLoading: boolean;
}

export interface FaceTrainerData {
  addBlendshape: () => void;
  takePicture: () => void;
  randomBlendshape: () => void;
  deletePicture: () => void;
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
          [`images/${len}.jpg`]: createNewBlendShape(),
        },
        currentBlendshapeIndex: len,
      };
    }
    case 'delete-blendshape': {
      // const blendshapes = [...state.blendshapes];
      // blendshapes.splice(state.currentBlendshapeIndex, 1);
      delete state.blendshapes[`images/${state.currentBlendshapeIndex}.jpg`];

      return {
        ...state,
        currentBlendshapeIndex: Math.max(0, state.currentBlendshapeIndex - 1),
      };
    }
    case 'random-blendshape': {
      // const blendshapes = [...state.blendshapes];
      // blendshapes[state.currentBlendshapeIndex] = {
      //   ...blendshapes[state.currentBlendshapeIndex],
      //   keys: randomFaceShape(),
      // };
      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`images/${state.currentBlendshapeIndex}.jpg`]: {
            ...state.blendshapes[`images/${state.currentBlendshapeIndex}.jpg`],
            keys: randomFaceShape(),
          },
        },
      };
    }
    case 'take-picture': {
      // const blendshapes = [...state.blendshapes];

      // blendshapes[action.index] = {
      //   ...blendshapes[action.index],
      //   imageData: action.image,
      //   imageExists: true,
      // };
      return {
        ...state,
        blendshapes: {
          ...state.blendshapes,
          [`images/${action.index}.jpg`]: {
            ...state.blendshapes[`images/${action.index}.jpg`],
            imageData: action.image,
            imageExists: !!action.image,
          },
        },
        imageLoading: false,
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
          [`images/${action.index}.jpg`]: {
            ...state.blendshapes[`images/${action.index}.jpg`],
            imageData: null,
            imageExists: false,
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
      blendshapes: { [`images/0.jpg`]: createNewBlendShape() },
      datasetLoading: true,
      imageLoading: true,
    } as TrainerState
  );

  const onReceiveTookPicture = (event, { index, image }) => {
    dispatch({
      type: 'take-picture',
      image: (image && `data:image/jpg;base64,${image}`) || null,
      index,
    });
  };

  const askPicture = (dataset: string, index: number) => {
    nativeAPI.send(FaceTrainerChannel.AskPicture, {
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
      askPicture(name, state.currentBlendshapeIndex);
    }
  };

  useLayoutEffect(() => {
    const name = dataset || `recorded_dataset_${Date.now()}`;
    nativeAPI.send(FaceTrainerChannel.OpenDataset, { name });
  }, []);

  useEffect(() => {
    nativeAPI.on(FaceTrainerChannel.ReceiveTookPicture, onReceiveTookPicture);
    nativeAPI.on(FaceTrainerChannel.ReceiveDataset, onReceiveDataset);

    return () => {
      nativeAPI.removeListener(
        FaceTrainerChannel.ReceiveTookPicture,
        onReceiveTookPicture
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
      askPicture(state.name, state.currentBlendshapeIndex - 1);
      dispatch({ type: 'prev-blendshape' });
    },
    nextBlendshape: () => {
      askPicture(state.name, state.currentBlendshapeIndex + 1);
      dispatch({ type: 'next-blendshape' });
    },
    addBlendshape: () => {
      dispatch({ type: 'add-blendshape' });
    },
    deleteBlendshape: () => {
      deletePicture(state.name, state.currentBlendshapeIndex);
      dispatch({ type: 'delete-blendshape' });
    },
    deletePicture: () => {
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
    takePicture: () => {
      nativeAPI.send(FaceTrainerChannel.TakePicture, {
        dataset: state.name,
        index: state.currentBlendshapeIndex,
        shapesCount: Object.keys(state.blendshapes).length,
        blendshapes:
          state.blendshapes[`images/${state.currentBlendshapeIndex}.jpg`].keys,
      });
    },
    save: () => {},
    currentBlendshape:
      state.blendshapes[`images/${state.currentBlendshapeIndex}.jpg`],
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
