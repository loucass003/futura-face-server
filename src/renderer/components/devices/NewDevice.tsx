import {
  Paper,
  Typography,
  Container,
  MenuItem,
  Box,
  Button,
  Grid,
  Select,
  SelectChangeEvent,
  TextField,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  InputLabel,
  FormControl,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { useNewDevice } from 'renderer/hooks/new-device';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect } from 'react';
import { GoBackButton } from '../commons/GoBackButton';

export function NewDevice() {
  const {
    state,
    setDevice,
    setDeviceType,
    uploadFirmware,
    setCommand,
    done,
    cancel,
    refresh,
  } = useNewDevice();

  const changeUsbDevice = (event: SelectChangeEvent) => {
    if (event.target.value !== 'none') setDevice(event.target.value);
  };

  const changeDeviceType = (event: SelectChangeEvent) => {
    setDeviceType(event.target.value as DeviceType);
  };

  const changeCommand = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(event.target.value);
  };

  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return (
    <Container>
      <Grid mt={2}>
        <Grid item>
          <Paper elevation={2}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
              p={2}
            >
              {state.uploadStatus === 'NONE' ? (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    component="div"
                    color="textPrimary"
                  >
                    <GoBackButton /> Create a new device
                  </Typography>
                  <FormControl>
                    <InputLabel id="device-type-label">Device type</InputLabel>
                    <Select
                      labelId="device-type"
                      label="Device Type"
                      value={state.deviceType}
                      onChange={changeDeviceType}
                    >
                      <MenuItem value="FuturaFaceTracker">
                        Futura Face Tracker
                      </MenuItem>
                      <MenuItem value="FuturaControllers">
                        Futura Controllers
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl style={{ flexDirection: 'row' }}>
                    <InputLabel id="usb-device-label">Usb device</InputLabel>
                    <Select
                      style={{ flexGrow: 1 }}
                      labelId="usb-device-label"
                      label="Usb device"
                      value={state.currentDevice}
                      onChange={changeUsbDevice}
                      displayEmpty
                    >
                      <MenuItem value="none" disabled>
                        Select a serial port
                      </MenuItem>
                      {state.devices &&
                        state.devices.length > 0 &&
                        state.devices.map((device) => (
                          <MenuItem key={device} value={device}>
                            {device}
                          </MenuItem>
                        ))}
                    </Select>
                    <IconButton size="large" onClick={refresh}>
                      <RefreshIcon />
                    </IconButton>
                  </FormControl>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Advanced options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        label="Esptool command"
                        multiline
                        maxRows={10}
                        onChange={changeCommand}
                        value={state.esptoolCommand}
                      />
                    </AccordionDetails>
                  </Accordion>

                  <Button onClick={uploadFirmware}>Upload</Button>
                </>
              ) : (
                <>
                  <Typography
                    variant="h5"
                    gutterBottom
                    component="div"
                    color="textPrimary"
                  >
                    <GoBackButton /> Uploading firmware
                  </Typography>
                  {state.uploadStatus === 'UPLOADING' ||
                  state.uploadStatus === 'STARTING' ? (
                    <>
                      <LinearProgress
                        variant="determinate"
                        value={state.uploadProgress}
                      />
                      <Button onClick={cancel}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="h5"
                        gutterBottom
                        component="div"
                        color={state.uploadExitCode === 0 ? 'green' : 'red'}
                      >
                        Upload{' '}
                        {state.uploadExitCode === 0 ? 'Success' : 'Failure'}
                      </Typography>
                      <Button onClick={done}>DONE</Button>
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
