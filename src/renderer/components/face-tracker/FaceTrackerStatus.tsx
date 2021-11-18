import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Slider,
} from '@mui/material';
import { useFaceTracker } from '../../hooks/face-tracker';

export function FaceTrackerStatus() {
  const { device, status, serverStatus, flash, changeFlash } = useFaceTracker();
  return (
    <Paper elevation={2}>
      <Typography variant="h5" gutterBottom component="div">
        Face Tracker status
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemText primary="IP" secondary={device.ip} />
        </ListItem>
        {status && (
          <ListItem disablePadding>
            <ListItemText primary="Battery" secondary={status.battery} />
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemText primary="Server Status" secondary={serverStatus} />
        </ListItem>
        <ListItem disablePadding>
          <ListItemText
            primary="Flash"
            secondary={
              <Slider
                value={flash}
                max={255}
                onChange={changeFlash}
                aria-label="Default"
                valueLabelDisplay="auto"
              />
            }
          />
        </ListItem>
      </List>
    </Paper>
  );
}
