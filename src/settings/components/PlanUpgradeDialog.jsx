import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import { useEffectAsync } from '../../reactHelper';

const useStyles = makeStyles()((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: '1200px',
      width: '100%',
      borderRadius: theme.spacing(2),
    },
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  dialogContent: {
    padding: theme.spacing(3),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all 0.3s ease',
    borderRadius: theme.spacing(2),
    border: '2px solid transparent',
  },
  currentPlanCard: {
    border: `2px solid ${theme.palette.success.main}`,
    backgroundColor: `${theme.palette.success.main}10`,
  },
  popularCard: {
    border: `2px solid ${theme.palette.secondary.main}`,
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
  },
  planName: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
  },
  price: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    lineHeight: 1,
  },
  period: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.9rem',
  },
  deviceLimit: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
    textAlign: 'center',
  },
  featuresList: {
    flexGrow: 1,
    marginBottom: theme.spacing(2),
    paddingLeft: 0,
  },
  featureItem: {
    padding: theme.spacing(0.5, 0),
  },
  featureIcon: {
    minWidth: theme.spacing(4),
    color: theme.palette.success.main,
  },
  upgradeButton: {
    padding: theme.spacing(1.5),
    fontSize: '0.95rem',
    fontWeight: 600,
    borderRadius: theme.spacing(1),
  },
  currentBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    zIndex: 1,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
}));

const PlanUpgradeDialog = ({ open, onClose, currentPlanId, userEmail }) => {
  const { classes, cx } = useStyles();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffectAsync(async () => {
    if (!open) return;

    try {
      setLoading(true);
      setError(null);

      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/plans`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.plans);
      } else {
        throw new Error('Failed to load plans');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Unable to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [open]);

  const handleUpgrade = async (plan) => {
    if (plan.id === currentPlanId) return;

    try {
      setProcessing(plan.id);
      setError(null);

      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          email: userEmail,
          metadata: {
            upgradeFrom: currentPlanId,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Stripe Checkout
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Unable to process upgrade. Please try again.');
      setProcessing(null);
    }
  };

  const getButtonText = (plan) => {
    if (plan.id === currentPlanId) {
      return 'Current Plan';
    }
    if (processing === plan.id) {
      return 'Processing...';
    }

    const currentPlan = plans.find(p => p.id === currentPlanId);
    if (currentPlan && plan.price > currentPlan.price) {
      return 'Upgrade';
    }
    if (currentPlan && plan.price < currentPlan.price) {
      return 'Downgrade';
    }
    return 'Switch Plan';
  };

  const getButtonIcon = (plan) => {
    const currentPlan = plans.find(p => p.id === currentPlanId);
    if (plan.price > currentPlan?.price) {
      return <TrendingUpIcon />;
    }
    if (plan.price < currentPlan?.price) {
      return <TrendingDownIcon />;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      className={classes.dialog}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Upgrade Your Plan
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Choose the perfect plan for your tracking needs
          </Typography>
        </Box>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plans.map((plan, index) => {
              const isCurrent = plan.id === currentPlanId;
              const isPopular = index === 1; // Mark second plan as popular

              return (
                <Grid item xs={12} sm={6} md={3} key={plan.id}>
                  <Card
                    className={cx(classes.card, {
                      [classes.currentPlanCard]: isCurrent,
                      [classes.popularCard]: isPopular && !isCurrent,
                    })}
                    elevation={isCurrent ? 4 : 2}
                  >
                    {isCurrent && (
                      <Chip
                        label="Current Plan"
                        color="success"
                        size="small"
                        className={classes.currentBadge}
                      />
                    )}
                    {isPopular && !isCurrent && (
                      <Chip
                        label="Popular"
                        color="secondary"
                        size="small"
                        className={classes.popularBadge}
                      />
                    )}

                    <CardContent className={classes.cardContent}>
                      <Typography className={classes.planName} color="textPrimary">
                        {plan.name}
                      </Typography>

                      <div className={classes.priceContainer}>
                        <Typography className={classes.price}>
                          ${plan.price}
                        </Typography>
                        <Typography className={classes.period}>
                          /month
                        </Typography>
                      </div>

                      <Box className={classes.deviceLimit}>
                        <Typography variant="body2" fontWeight={600}>
                          Up to {plan.deviceLimit} devices
                        </Typography>
                      </Box>

                      <List className={classes.featuresList} dense disablePadding>
                        {plan.features.slice(0, 4).map((feature, idx) => (
                          <ListItem key={idx} className={classes.featureItem} disableGutters>
                            <ListItemIcon className={classes.featureIcon}>
                              <CheckCircleIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{ variant: 'body2', fontSize: '0.85rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Button
                        variant={isCurrent ? 'outlined' : 'contained'}
                        color="primary"
                        fullWidth
                        className={classes.upgradeButton}
                        onClick={() => handleUpgrade(plan)}
                        disabled={isCurrent || processing}
                        startIcon={processing === plan.id ? <CircularProgress size={16} /> : getButtonIcon(plan)}
                      >
                        {getButtonText(plan)}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: 3, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlanUpgradeDialog;
