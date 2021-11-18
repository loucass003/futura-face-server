import { FaceRecorderChannel, RecordingStatus } from 'ipcTypes';
import { useEffect, useState } from 'react';
import { useNativeAPI } from './native-api';

export function useFaceRecorder() {
  const nativeAPI = useNativeAPI();
  const [recording, setRecording] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>('none');

  const onRecordingStatus = (
    event,
    { status }: { status: RecordingStatus }
  ) => {
    setRecordingStatus(status);
    console.log('recording status', status);
  };

  useEffect(() => {
    nativeAPI.on(FaceRecorderChannel.RecordingStatus, onRecordingStatus);

    return () => {
      nativeAPI.removeListener(
        FaceRecorderChannel.RecordingStatus,
        onRecordingStatus
      );
    };
  });

  return {
    recording,
    recordingStatus,
    start: () => {
      nativeAPI.send(FaceRecorderChannel.StartRecording);
      setRecording(true);
    },
    cancel: () => {
      nativeAPI.send(FaceRecorderChannel.CancelRecording);
      setRecording(false);
    },
  };
}
