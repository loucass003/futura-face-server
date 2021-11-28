import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import { MemoryRouter as Router } from 'react-router-dom';
import { FuturaDevicesProvider } from './components/devices/FuturaDevicesProvider';
import { Routes } from './router';
import Navbar from './components/commons/Navbar';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import { orange, purple, grey } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: orange,
    text: {
      primary: grey[50]
    }
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <FuturaDevicesProvider>
          <Navbar />
          <Routes />
        </FuturaDevicesProvider>
      </Router>
    </ThemeProvider>
  );
}
