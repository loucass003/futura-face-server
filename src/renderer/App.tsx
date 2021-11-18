import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import { MemoryRouter as Router } from 'react-router-dom';
import { FuturaDevicesProvider } from './components/devices/FuturaDevicesProvider';
import { Routes } from './router';
import Navbar from './components/commons/Navbar';

export default function App() {
  return (
    <Router>
      <FuturaDevicesProvider>
        <Navbar />
        <Routes />
      </FuturaDevicesProvider>
    </Router>
  );
}
