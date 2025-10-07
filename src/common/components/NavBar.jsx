import {
  AppBar, Toolbar, Typography, IconButton,
} from '@mui/material';
import HugeIcon from './HugeIcon';
import { Menu01Icon } from '@hugeicons-pro/core-duotone-rounded';

const Navbar = ({ setOpenDrawer, title }) => (
  <AppBar position="sticky" color="inherit">
    <Toolbar>
      <IconButton
        color="inherit"
        edge="start"
        sx={{ mr: 2 }}
        onClick={() => setOpenDrawer(true)}
      >
        <HugeIcon icon={Menu01Icon} />
      </IconButton>
      <Typography variant="h6" noWrap>
        {title}
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;
