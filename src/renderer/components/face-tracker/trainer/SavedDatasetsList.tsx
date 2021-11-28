import {
  Button,
  Container,
  Grid,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Box } from '@mui/system';
import { FaceTrainerChannel } from 'ipcTypes';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNativeAPI } from 'renderer/hooks/native-api';

const style = {
  // eslint-disable-next-line @typescript-eslint/prefer-as-const
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
};

export function SavedDatasetsList() {
  const nativeAPI = useNativeAPI();
  const [savedDatasets, setSavedDatasets] = useState<string[]>([]);
  const [modal, setModal] = useState<string | null>(null);

  const updateSavedDatasets = (
    event: any,
    { datasets_names }: { datasets_names: string[] }
  ) => {
    setSavedDatasets(datasets_names);
  };

  const deleteDataset = (dataset: string) => {
    nativeAPI.send(FaceTrainerChannel.DeleteDataset, { name: dataset });
    setModal(null);
  };

  useEffect(() => {
    nativeAPI.send(FaceTrainerChannel.AskSavedDatasets);
    nativeAPI.on(FaceTrainerChannel.SavedDatasets, updateSavedDatasets);

    return () => {
      nativeAPI.removeListener(
        FaceTrainerChannel.SavedDatasets,
        updateSavedDatasets
      );
    };
  }, []);

  return (
    <Container>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Paper>
            <Button component={Link} to="/face-tracker-train/new">
              Open Dataset ZIP
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="h5"
            gutterBottom
            component="div"
            color="textPrimary"
          >
            Saved Datasets List
          </Typography>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedDatasets.map((dataset_name) => (
                  <TableRow key={dataset_name}>
                    <TableCell component="th" scope="row">
                      {dataset_name}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Button
                        component={Link}
                        to={`/face-tracker-train/${dataset_name}`}
                      >
                        Load
                      </Button>
                      <Button onClick={() => setModal(dataset_name)}>
                        Delete Dataset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Modal open={!!modal} onClose={() => setModal(null)}>
        <Box sx={style}>
          <Paper>
            <Box p={4}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Delete dataset {modal} ?
              </Typography>
              <Button onClick={() => deleteDataset(modal)}>Confirm</Button>
              <Button onClick={() => setModal(null)}>Cancel</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>
    </Container>
  );
}
