import {
  Divider, List,
} from '@mui/material';
import HugeIcon from '../../common/components/HugeIcon';
import {
  SlidersHorizontalIcon,
  // Use a valid drawing/geofence icon from the package
  DrawingModeIcon,
  Notification01Icon,
  Folder01Icon,
  UserIcon,
  Settings01Icon,
  ToolsIcon,
  UserGroupIcon,
  Calendar01Icon,
  SendToMobileIcon,
  ServerStack01Icon,
  HelpCircleIcon,
  Payment01Icon,
  CreditCardIcon,
  Megaphone01Icon,
  CalculateIcon,
} from '@hugeicons-pro/core-duotone-rounded';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../../common/components/LocalizationProvider';
import {
  useAdministrator, useManager, useRestriction,
} from '../../common/util/permissions';
import useFeatures from '../../common/util/useFeatures';
import MenuItem from '../../common/components/MenuItem';

const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector((state) => state.session.server.attributes.support);
  const billingLink = useSelector((state) => state.session.user.attributes.billingLink);

  const features = useFeatures();

  return (
    <>
      <List>
        <MenuItem
          title={t('sharedPreferences')}
          link="/settings/preferences"
          icon={<HugeIcon icon={SlidersHorizontalIcon} />}
          selected={location.pathname === '/settings/preferences'}
        />
        {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link="/settings/notifications"
              icon={<HugeIcon icon={Notification01Icon} />}
              selected={location.pathname.startsWith('/settings/notification')}
            />
            <MenuItem
              title={t('settingsUser')}
              link={`/settings/user/${userId}`}
              icon={<HugeIcon icon={UserIcon} />}
              selected={location.pathname === `/settings/user/${userId}`}
            />
            <MenuItem
              title="Subscription"
              link="/settings/subscription"
              icon={<HugeIcon icon={CreditCardIcon} />}
              selected={location.pathname === '/settings/subscription'}
            />
            <MenuItem
              title={t('deviceTitle')}
              link="/settings/devices"
              icon={<HugeIcon icon={ServerStack01Icon} />}
              selected={location.pathname.startsWith('/settings/device')}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link="/geofences"
              icon={<HugeIcon icon={DrawingModeIcon} />}
              selected={location.pathname.startsWith('/settings/geofence')}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t('settingsGroups')}
                link="/settings/groups"
              icon={<HugeIcon icon={Folder01Icon} />}
                selected={location.pathname.startsWith('/settings/group')}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t('sharedDrivers')}
                link="/settings/drivers"
              icon={<HugeIcon icon={UserIcon} />}
                selected={location.pathname.startsWith('/settings/driver')}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t('sharedCalendars')}
                link="/settings/calendars"
              icon={<HugeIcon icon={Calendar01Icon} />}
                selected={location.pathname.startsWith('/settings/calendar')}
              />
            )}
            {!features.disableComputedAttributes && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link="/settings/attributes"
              icon={<HugeIcon icon={CalculateIcon} />}
                selected={location.pathname.startsWith('/settings/attribute')}
              />
            )}
            {!features.disableMaintenance && (
              <MenuItem
                title={t('sharedMaintenance')}
                link="/settings/maintenances"
              icon={<HugeIcon icon={ToolsIcon} />}
                selected={location.pathname.startsWith('/settings/maintenance')}
              />
            )}
            {!features.disableSavedCommands && (
              <MenuItem
                title={t('sharedSavedCommands')}
                link="/settings/commands"
              icon={<HugeIcon icon={SendToMobileIcon} />}
                selected={location.pathname.startsWith('/settings/command')}
              />
            )}
          </>
        )}
        {billingLink && (
          <MenuItem
            title={t('userBilling')}
            link={billingLink}
          icon={<HugeIcon icon={Payment01Icon} />}
          />
        )}
        {supportLink && (
          <MenuItem
            title={t('settingsSupport')}
            link={supportLink}
          icon={<HugeIcon icon={HelpCircleIcon} />}
          />
        )}
      </List>
      {manager && (
        <>
          <Divider />
          <List>
            <MenuItem
              title={t('serverAnnouncement')}
              link="/settings/announcement"
              icon={<HugeIcon icon={Megaphone01Icon} />}
              selected={location.pathname === '/settings/announcement'}
            />
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link="/settings/server"
              icon={<HugeIcon icon={Settings01Icon} />}
                selected={location.pathname === '/settings/server'}
              />
            )}
            <MenuItem
              title={t('settingsUsers')}
              link="/settings/users"
              icon={<HugeIcon icon={UserGroupIcon} />}
              selected={location.pathname.startsWith('/settings/user') && location.pathname !== `/settings/user/${userId}`}
            />
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
