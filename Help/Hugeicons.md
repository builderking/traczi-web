## Hugeicons in Traczi Web — Quick Helper

Keep this short checklist handy when adding or replacing icons.

### Packages

- `@hugeicons/react` (renderer for React)
- `@hugeicons-pro/core-duotone-rounded` (icon set)

Auth for Pro icons lives in `.npmrc` at the project root:

```ini
@hugeicons-pro:registry=https://npm.hugeicons.com/
//npm.hugeicons.com/:_authToken=<YOUR_PRO_LICENSE_KEY>
```

Docs: [Hugeicons React](https://hugeicons.com/docs/integrations/react)

### Our Wrapper

Use the central wrapper so icons are consistent and default to 20px.

```jsx
// src/common/components/HugeIcon.jsx
import { HugeiconsIcon } from "@hugeicons/react";

const HugeIcon = ({
  icon,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.5,
  primaryColor,
  secondaryColor,
  disableSecondaryOpacity = false,
  ...rest
}) => (
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
```

Usage example:

```jsx
import HugeIcon from "../common/components/HugeIcon";
import { Notification01Icon } from "@hugeicons-pro/core-duotone-rounded";

<HugeIcon icon={Notification01Icon} />;
```

### Finding Correct Icon Names

- Names must match exports exactly from the chosen package (e.g. `UserIcon`, `UserGroupIcon`, `ServerStack01Icon`, `DrawingModeIcon`).
- Look up names in the docs or by searching `node_modules/@hugeicons-pro/core-duotone-rounded/dist/esm/index.js`.
- If you see “does not provide an export named …”, you used a wrong name — pick a valid one from the docs/file.

### Replacing MUI Icons

1. Find usages:
   - Search for `@mui/icons-material` imports.
2. Replace with Hugeicons:
   - Import the closest matching Hugeicons (duotone) name.
   - Render via `<HugeIcon icon={...} />` (keeps default size ≤ 20px).
3. Verify visually and keep sizes ≤ 20 unless a specific design needs smaller.

### Duotone Tips

- `primaryColor` and `secondaryColor` control duotone colors.
- Set `disableSecondaryOpacity` if you want both tones fully opaque.

### Common Pitfalls

- Wrong icon names → export errors at runtime. Always confirm the exact export.
- After changing a lot of imports, restart dev server if Vite caches stale modules.
- Keep a consistent size (`size={20}` default) unless a specific component requires a different value.

### Reference

- Docs: [Hugeicons React](https://hugeicons.com/docs/integrations/react)
