import { Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { DevicesList } from '../devices/DevicesList';

export function Home() {
  return (
    <Container>
      <DevicesList />
      <Button component={Link} to="/new-device">
        Create a new Device
      </Button>
    </Container>
  );
}
