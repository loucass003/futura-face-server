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
import { useFaceTracker } from '../face-tracker';
import { useNativeAPI } from '../native-api';

export type TrainerAction =
  | {
      type: 'new-blendshape';
    }
  | {
      type: 'take-picture';
      image: string;
      name: string;
    };

export interface Blendshape {
  keys: number[];
  image: string;
  name: string;
}

export interface TrainerState {
  name: string;
  blenshapesCount: number;
  blendshapes: Array<Blendshape>;
  currentBlendshapeIndex: number;
}

export interface FaceTrainerData {
  newBlendShape: () => void;
  takePicture: () => void;
  save: () => void;
  currentBlendshape?: Blendshape;
  state: TrainerState;
}

export const FaceTrainerContext = createContext<FaceTrainerData>(
  undefined as any
);

function createNewBlendShape() {
  const blendshape = Array.from(
    { length: Object.values(shapeKeys).length },
    () => 0
  );

  return { keys: blendshape, image: null, name: null };
}

function reducer(state: TrainerState, action: TrainerAction): TrainerState {
  switch (action.type) {
    case 'new-blendshape': {
      return {
        ...state,
        blendshapes: [...state.blendshapes, createNewBlendShape()],
      };
    }
    case 'take-picture': {
      const blendshapes = [...state.blendshapes];

      blendshapes[state.currentBlendshapeIndex] = {
        ...blendshapes[state.currentBlendshapeIndex],
        image: action.image,
        name: action.name,
      };
      console.log('hey');
      return {
        ...state,
        blendshapes,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
  }
}

export function useProvideFaceTrainer(): FaceTrainerData {
  const nativeAPI = useNativeAPI();
  const { frameData } = useFaceTracker();
  const { dataset } = useParams<{ dataset: string }>();
  const [state, dispatch] = useReducer<Reducer<TrainerState, TrainerAction>>(
    reducer,
    {
      name: 'none',
      blenshapesCount: 0,
      currentBlendshapeIndex: 0,
      blendshapes: [],
    } as TrainerState
  );

  useEffect(() => {
    return () => {};
  }, []);

  return {
    state,
    newBlendShape: () => dispatch({ type: 'new-blendshape' }),
    takePicture: () => {
      const name = `record_image_${Date.now()}.jpg`;
      dispatch({
        type: 'take-picture',
        image: `data:image/jpg;base64,${frameData.toString('base64url')}`,
        name,
      });
      nativeAPI.send(FaceTrainerChannel.SavePicture, {
        image: frameData,
        name,
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
