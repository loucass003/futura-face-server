import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useFuturaDevices } from '../../hooks/devices';

export function DevicesList() {
  const { state, refresh } = useFuturaDevices();

  return (
    <>
      <Typography variant="h5" gutterBottom component="div">
        Devices
        <Button onClick={() => refresh()}>Refresh</Button>
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Device ID</TableCell>
              <TableCell>Device Type</TableCell>
              <TableCell>IP</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(state.devices).map((device) => (
              <TableRow key={device.id}>
                <TableCell component="th" scope="row">
                  {device.id}
                </TableCell>
                <TableCell component="th" scope="row">
                  {device.type}
                </TableCell>
                <TableCell component="th" scope="row">
                  {device.ip}
                </TableCell>
                <TableCell component="th" scope="row">
                  {device.type === 'FuturaFaceTracker' && (
                    <Button>Set As Default</Button>
                  )}
                  <Button component={Link} to={`/${device.type}/${device.id}`}>
                    Informations
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
