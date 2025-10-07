import { useTheme } from '@mui/material';
import HugeIcon from './HugeIcon';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons-pro/core-duotone-rounded';

const BackIcon = () => {
  const theme = useTheme();
  return theme.direction === 'rtl'
    ? <HugeIcon icon={ArrowRight01Icon} />
    : <HugeIcon icon={ArrowLeft01Icon} />;
};

export default BackIcon;
