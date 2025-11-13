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
  Divider,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CalendarToday as CalendarIcon,
  CreditCard as CreditCardIcon,
  Devices as DevicesIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Upgrade as UpgradeIcon,
} from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import dayjs from 'dayjs';
import PageLayout from '../common/components/PageLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { useEffectAsync } from '../reactHelper';
import SettingsMenu from './components/SettingsMenu';
import PlanUpgradeDialog from './components/PlanUpgradeDialogV2';
import PlanSelection from '../components/billing/PlanSelection';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(3),
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  card: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    },
  },
  planCard: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
    border: `2px solid ${theme.palette.primary.main}30`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  cardIcon: {
    color: theme.palette.primary.main,
    fontSize: '1.75rem',
  },
  section: {
    marginBottom: theme.spacing(2.5),
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(1),
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  value: {
    fontWeight: 600,
    fontSize: '1.125rem',
    color: theme.palette.text.primary,
  },
  planName: {
    fontWeight: 700,
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statusChip: {
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '28px',
    borderRadius: '14px',
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  progressBar: {
    height: '10px',
    borderRadius: '5px',
  },
  usageText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  usageStats: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  manageButton: {
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5, 4),
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flex: 1,
    minWidth: '200px',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  divider: {
    margin: theme.spacing(2, 0),
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
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);

    try {
      setError(null);

      // Create checkout session for the selected plan
      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          email: user.email,
          metadata: {
            userName: user.name,
            userEmail: user.email,
            planId: plan.id,
            deviceLimit: plan.deviceLimit,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.sessionUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Unable to start checkout process. Please try again.');
    }
  };

  const isSubscriptionCancelledOrExpired = () => {
    if (!subscription?.subscriptionId) return true;
    const status = subscription?.status?.toLowerCase();
    return status === 'canceled' || status === 'incomplete_expired';
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
        <Box className={classes.header}>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.5px' }}>
            Subscription Management
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.05rem' }}>
            Manage your subscription plan and billing information
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {isSubscriptionCancelledOrExpired() ? (
          <>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              {!subscription?.subscriptionId
                ? 'No active subscription found. Choose a plan below to get started.'
                : 'Your subscription has been cancelled. Re-subscribe below to restore access to your devices and continue tracking.'}
            </Alert>
            <PlanSelection
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
            />
          </>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className={`${classes.card} ${classes.planCard}`}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <CreditCardIcon className={classes.cardIcon} />
                      <Typography variant="h5" fontWeight={700}>
                        Current Plan
                      </Typography>
                    </Box>

                    <Box className={classes.section}>
                      <Typography className={classes.planName}>
                        {subscription.plan?.toUpperCase() || 'N/A'} Plan
                      </Typography>
                    </Box>

                    <Divider className={classes.divider} />

                    <Stack spacing={1.5}>
                      <Box className={classes.infoRow}>
                        <Typography className={classes.label}>
                          <CheckCircleIcon fontSize="small" />
                          Status
                        </Typography>
                        <Chip
                          label={subscription.status?.toUpperCase() || 'UNKNOWN'}
                          color={getStatusColor(subscription.status)}
                          size="small"
                          className={classes.statusChip}
                        />
                      </Box>

                      {subscription.startDate && (
                        <Box className={classes.infoRow}>
                          <Typography className={classes.label}>
                            <CalendarIcon fontSize="small" />
                            Member Since
                          </Typography>
                          <Typography className={classes.value}>
                            {dayjs(subscription.startDate).format('MMMM D, YYYY')}
                          </Typography>
                        </Box>
                      )}

                      {subscription.currentPeriodEnd && (
                        <Box className={classes.infoRow}>
                          <Typography className={classes.label}>
                            <CalendarIcon fontSize="small" />
                            {subscription.cancelAtPeriodEnd ? 'Expires On' : 'Next Billing Date'}
                          </Typography>
                          <Typography className={classes.value}>
                            {dayjs(subscription.currentPeriodEnd * 1000).format('MMMM D, YYYY')}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className={classes.card}>
                  <CardContent>
                    <Box className={classes.cardHeader}>
                      <DevicesIcon className={classes.cardIcon} />
                      <Typography variant="h5" fontWeight={700}>
                        Device Usage
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <Box className={classes.infoRow}>
                        <Typography className={classes.label}>
                          <TrendingUpIcon fontSize="small" />
                          Device Limit
                        </Typography>
                        <Typography className={classes.value}>
                          {user.deviceLimit === -1 ? 'Unlimited' : user.deviceLimit} devices
                        </Typography>
                      </Box>

                      <Box className={classes.progressContainer}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body2" color="textSecondary" fontWeight={500}>
                            Devices Used
                          </Typography>
                          <Box className={classes.usageStats}>
                            <DevicesIcon fontSize="small" />
                            {deviceCount} / {user.deviceLimit === -1 ? '∞' : user.deviceLimit}
                          </Box>
                        </Box>

                        {user.deviceLimit !== -1 && (
                          <>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(getUsagePercentage(), 100)}
                              color={getUsagePercentage() > 90 ? 'error' : 'primary'}
                              className={classes.progressBar}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <Typography variant="body2" fontWeight={600} color={getUsagePercentage() > 90 ? 'error' : 'primary'}>
                                {Math.round(getUsagePercentage())}% Used
                              </Typography>
                            </Box>
                          </>
                        )}
                      </Box>
                    </Stack>

                    {getUsagePercentage() > 80 && user.deviceLimit !== -1 && (
                      <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                        You're approaching your device limit. Consider upgrading your plan.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {subscription.cancelAtPeriodEnd && (
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                Your subscription is set to cancel on{' '}
                {dayjs(subscription.currentPeriodEnd * 1000).format('MMMM D, YYYY')}.
                You can reactivate it through the billing portal.
              </Alert>
            )}

            <Card className={classes.card}>
              <CardContent>
                <Box className={classes.cardHeader}>
                  <SettingsIcon className={classes.cardIcon} />
                  <Typography variant="h5" fontWeight={700}>
                    Billing Management
                  </Typography>
                </Box>

                <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 3 }}>
                  Manage your payment methods, view invoices, update billing information,
                  or change your subscription plan through the Stripe Customer Portal.
                </Typography>

                <Divider className={classes.divider} />

                <Box className={classes.buttonGroup}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => setUpgradeDialogOpen(true)}
                    className={classes.manageButton}
                    startIcon={<UpgradeIcon />}
                  >
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    onClick={handleManageSubscription}
                    disabled={processingPortal}
                    className={classes.manageButton}
                    startIcon={processingPortal ? <CircularProgress size={20} color="inherit" /> : <SettingsIcon />}
                  >
                    {processingPortal ? 'Opening Portal...' : 'Manage Subscription'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        <PlanUpgradeDialog
          open={upgradeDialogOpen}
          onClose={() => setUpgradeDialogOpen(false)}
          currentPlanId={subscription?.plan}
          userEmail={user.email}
        />
      </Box>
    </PageLayout>
  );
};

export default SubscriptionPage;
