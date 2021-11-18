import { Route, Switch } from 'react-router-dom';
import { NewDevice } from './components/devices/NewDevice';
import { FaceTracker } from './components/face-tracker/FaceTracker';
import { FaceTrackerProvider } from './components/face-tracker/FaceTrackerProvider';
import { FaceTrackerRecord } from './components/face-tracker/FaceTrackerRecord';
import { FaceTrackerSettings } from './components/face-tracker/settings/FaceTrackerSettings';
import { FaceTrackerTainer } from './components/face-tracker/trainer/FaceTrackerTrainer';
import { FaceTrainerProvider } from './components/face-tracker/trainer/FaceTrainerProvider';
import { SavedDatasetsList } from './components/face-tracker/trainer/SavedDatasetsList';
import { Home } from './components/home/Home';

export interface RouterLocationState {
  is404?: boolean;
  fallback?: string;
}

export function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/new-device" component={NewDevice} />
      <Route path="/face-tracker-settings" component={FaceTrackerSettings}></Route>
      <Route path="/face-tracker-train">
          <Switch>
            <Route path="/face-tracker-train" exact component={SavedDatasetsList}></Route>
            <Route path="/face-tracker-train/:dataset">
            <FaceTrainerProvider>
              <FaceTrackerTainer></FaceTrackerTainer>
            </FaceTrainerProvider>
            </Route>
          </Switch>
      </Route>
      <Route path="/FuturaFaceTracker/:id">
        <FaceTrackerProvider>
          <Switch>
            <Route path="/FuturaFaceTracker/:id" exact component={FaceTracker} />
            <Route path="/FuturaFaceTracker/:id/record" component={FaceTrackerRecord} />
          </Switch>
        </FaceTrackerProvider>
      </Route>
    </Switch>
  );
}
