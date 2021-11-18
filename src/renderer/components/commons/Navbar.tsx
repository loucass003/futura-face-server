import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FaceIcon from '@mui/icons-material/Face';
import ListIcon from '@mui/icons-material/List';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function ButtonAppBar() {
  const [state, setState] = React.useState<boolean>(false);

  const toggleDrawer = () => {
    setState((prev) => !prev);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Futura Server
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer open={state} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="Devices List" />
            </ListItem>
            <ListItem button component={Link} to="/face-tracker-settings">
              <ListItemIcon>
                <FaceIcon />
              </ListItemIcon>
              <ListItemText primary="Face Tracker" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
