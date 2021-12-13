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

export type TrainerAction =
  | {
      type: 'open-dataset';
      name: string;
      dataset?: IDataset;
    }
  | {
      type: 'add-blendshape';
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
  blendshapes: Array<IBlendshape>;
  currentBlendshapeIndex: number;
  datasetLoading: boolean;
}

export interface FaceTrainerData {
  addBlendshape: () => void;
  takePicture: () => void;
  deletePicture: () => void;
  prevBlendshape: () => void;
  nextBlendshape: () => void;
  save: () => void;
  currentBlendshape?: IBlendshape;
  state: TrainerState;
}

export const FaceTrainerContext = createContext<FaceTrainerData>(
  undefined as any
);

function createNewBlendShape() {
  const blendshape = Array.from(
    { length: Object.values(shapeKeys).length },
    () => Math.random() * 0.2
  );

  return { keys: blendshape, imageData: null };
}

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case 'open-dataset': {
      return {
        ...state,
        ...(action.dataset || {}),
        name: action.name,
        datasetLoading: false,
        currentBlendshapeIndex: 0,
      };
    }
    case 'add-blendshape': {
      return {
        ...state,
        blendshapes: [...state.blendshapes, createNewBlendShape()],
      };
    }
    case 'take-picture': {
      const blendshapes = [...state.blendshapes];

      blendshapes[action.index] = {
        ...blendshapes[action.index],
        imageData: action.image,
      };
      return {
        ...state,
        blendshapes,
      };
    }
    case 'delete-picture': {
      const blendshapes = [...state.blendshapes];

      blendshapes[action.index] = {
        ...blendshapes[action.index],
        imageData: null,
      };

      return {
        ...state,
        blendshapes,
      };
    }
    case 'next-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex + 1,
      };
    }
    case 'prev-blendshape': {
      return {
        ...state,
        currentBlendshapeIndex: state.currentBlendshapeIndex - 1,
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
      name: 'none',
      currentBlendshapeIndex: 0,
      blendshapes: [createNewBlendShape()],
      datasetLoading: true,
    } as TrainerState
  );

  const onReceiveTookPicture = (event, { index, image }) => {
    dispatch({
      type: 'take-picture',
      image: `data:image/jpg;base64,${image}`,
      index,
    });
  };

  const onReceiveDataset = (event, { name, dataset }) => {
    dispatch({ type: 'open-dataset', name, dataset });
  };

  useLayoutEffect(() => {
    const name = dataset || `recorded_dataset_${Date.now()}`;
    nativeAPI.send(FaceTrainerChannel.OpenDataset, { name });
  }, [dataset]);

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
    prevBlendshape: () => dispatch({ type: 'prev-blendshape' }),
    nextBlendshape: () => dispatch({ type: 'next-blendshape' }),
    addBlendshape: () => {
      dispatch({ type: 'add-blendshape' });
      dispatch({ type: 'next-blendshape' });
    },
    deletePicture: () => {
      dispatch({
        type: 'delete-picture',
        index: state.currentBlendshapeIndex,
      });
      // TODO SEND EVEN TO DELETE PICTURE FROM ZIP
    },
    takePicture: () => {
      nativeAPI.send(FaceTrainerChannel.TakePicture, {
        dataset: state.name,
        index: state.currentBlendshapeIndex,
        shapesCount: state.blendshapes.length,
        blendshapes: state.blendshapes[state.currentBlendshapeIndex].keys,
      });
    },
    save: () => {},
    currentBlendshape: state.blendshapes[state.currentBlendshapeIndex],
  };
}

export function useFaceTrainer(): FaceTrainerData {
  const context = useContext<FaceTrainerData>(FaceTrainerContext);
  if (context === undefined) {
    throw new Error('useFaceTrainer must be used within a FaceTrainerProvider');
  }
  return context;
}
