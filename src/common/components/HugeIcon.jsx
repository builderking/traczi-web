import { HugeiconsIcon } from '@hugeicons/react';

const HugeIcon = ({ icon, size = 20, color = 'currentColor', strokeWidth = 1.5, primaryColor, secondaryColor, disableSecondaryOpacity = false, ...rest }) => (
  <HugeiconsIcon
    icon={icon}
    size={size}
    color={color}
    strokeWidth={strokeWidth}
    primaryColor={primaryColor}
    secondaryColor={secondaryColor}
    disableSecondaryOpacity={disableSecondaryOpacity}
    {...rest}
  />
);

export default HugeIcon;