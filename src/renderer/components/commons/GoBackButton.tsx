import { ArrowBack } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useHistory } from 'react-router';

export function GoBackButton() {
  const history = useHistory();
  const goBack = () => {
    history.goBack();
  };
  return (
    <IconButton type="button" onClick={goBack}>
      <ArrowBack />
    </IconButton>
  );
}
