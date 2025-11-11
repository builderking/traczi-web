import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import dayjs from 'dayjs';
import PageLayout from '../common/components/PageLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useEffectAsync } from '../reactHelper';
import SettingsMenu from './components/SettingsMenu';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  card: {
    marginBottom: theme.spacing(3),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
  label: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  value: {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  statusChip: {
    fontWeight: 600,
  },
  progressContainer: {
    marginTop: theme.spacing(1),
  },
  usageText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.5),
    fontSize: '0.875rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}));

const SubscriptionPage = () => {
  const { classes } = useStyles();
  const t = useTranslation();
  const user = useSelector((state) => state.session.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [deviceCount, setDeviceCount] = useState(0);
  const [processingPortal, setProcessingPortal] = useState(false);

  useEffectAsync(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get subscription data from user attributes
      const subData = {
        customerId: user.attributes?.stripeCustomerId,
        subscriptionId: user.attributes?.stripeSubscriptionId,
        plan: user.attributes?.subscriptionPlan,
        status: user.attributes?.subscriptionStatus,
        startDate: user.attributes?.subscriptionStartDate,
      };

      if (subData.subscriptionId) {
        // Fetch detailed subscription info from Stripe
        const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
        const response = await fetch(
          `${billingApiUrl}/billing/subscription/${subData.subscriptionId}`
        );
        const data = await response.json();

        if (data.success) {
          setSubscription({
            ...subData,
            ...data.subscription,
          });
        } else {
          setSubscription(subData);
        }
      } else {
        setSubscription(subData);
      }

      // Get device count from Traccar
      const devicesResponse = await fetch('/api/devices');
      if (devicesResponse.ok) {
        const devices = await devicesResponse.json();
        setDeviceCount(devices.length);
      } else {
        setDeviceCount(0);
      }

    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleManageSubscription = async () => {
    if (!subscription?.customerId) {
      setError('No customer ID found');
      return;
    }

    try {
      setProcessingPortal(true);
      setError(null);

      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription.customerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open portal');
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      setError('Unable to open billing portal. Please try again.');
      setProcessingPortal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
      case 'unpaid':
        return 'warning';
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUsagePercentage = () => {
    if (!user.deviceLimit || user.deviceLimit === -1) return 0;
    return (deviceCount / user.deviceLimit) * 100;
  };

  if (loading) {
    return (
      <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'subscription']}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'subscription']}>
      <Box className={classes.container}>
        <div className={classes.header}>
          <Typography variant="h4" gutterBottom>
            Subscription Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your subscription plan and billing information
          </Typography>
        </div>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!subscription?.subscriptionId ? (
          <Alert severity="warning">
            No active subscription found. Please contact support if you believe this is an error.
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Plan
                    </Typography>

                    <Box className={classes.section}>
                      <Typography className={classes.label}>Plan Name</Typography>
                      <Typography className={classes.value}>
                        {subscription.plan?.toUpperCase() || 'N/A'} Plan
                      </Typography>
                    </Box>

                    <Box className={classes.section}>
                      <Typography className={classes.label}>Status</Typography>
                      <Chip
                        label={subscription.status?.toUpperCase() || 'UNKNOWN'}
                        color={getStatusColor(subscription.status)}
                        size="small"
                        className={classes.statusChip}
                      />
                    </Box>

                    {subscription.startDate && (
                      <Box className={classes.section}>
                        <Typography className={classes.label}>Member Since</Typography>
                        <Typography className={classes.value}>
                          {dayjs(subscription.startDate).format('MMMM D, YYYY')}
                        </Typography>
                      </Box>
                    )}

                    {subscription.currentPeriodEnd && (
                      <Box className={classes.section}>
                        <Typography className={classes.label}>
                          {subscription.cancelAtPeriodEnd ? 'Expires On' : 'Next Billing Date'}
                        </Typography>
                        <Typography className={classes.value}>
                          {dayjs(subscription.currentPeriodEnd * 1000).format('MMMM D, YYYY')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Device Usage
                    </Typography>

                    <Box className={classes.section}>
                      <Typography className={classes.label}>Device Limit</Typography>
                      <Typography className={classes.value}>
                        {user.deviceLimit === -1 ? 'Unlimited' : user.deviceLimit} devices
                      </Typography>
                    </Box>

                    <Box className={classes.section}>
                      <Typography className={classes.label}>Devices Used</Typography>
                      <div className={classes.progressContainer}>
                        <div className={classes.usageText}>
                          <Typography color="textSecondary">
                            {deviceCount} of {user.deviceLimit === -1 ? '∞' : user.deviceLimit}
                          </Typography>
                          <Typography color="textSecondary">
                            {user.deviceLimit !== -1 && `${Math.round(getUsagePercentage())}%`}
                          </Typography>
                        </div>
                        {user.deviceLimit !== -1 && (
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(getUsagePercentage(), 100)}
                            color={getUsagePercentage() > 90 ? 'error' : 'primary'}
                          />
                        )}
                      </div>
                    </Box>

                    {getUsagePercentage() > 80 && user.deviceLimit !== -1 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        You're approaching your device limit. Consider upgrading your plan.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {subscription.cancelAtPeriodEnd && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Your subscription is set to cancel on{' '}
                {dayjs(subscription.currentPeriodEnd * 1000).format('MMMM D, YYYY')}.
                You can reactivate it through the billing portal.
              </Alert>
            )}

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Billing Management
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Manage your payment methods, view invoices, update billing information,
                  or change your subscription plan through the Stripe Customer Portal.
                </Typography>

                <div className={classes.buttonGroup}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleManageSubscription}
                    disabled={processingPortal}
                  >
                    {processingPortal ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Opening Portal...
                      </>
                    ) : (
                      'Manage Subscription'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default SubscriptionPage;
