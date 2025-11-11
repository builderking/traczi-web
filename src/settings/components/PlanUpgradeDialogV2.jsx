import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Radio,
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import { useEffectAsync } from '../../reactHelper';

const useStyles = makeStyles()((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      maxWidth: '900px',
      width: '100%',
      borderRadius: theme.spacing(3),
      padding: 0,
      maxHeight: '90vh',
    },
  },
  header: {
    padding: theme.spacing(3, 3, 2, 3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  content: {
    padding: theme.spacing(0, 3, 4, 3),
    overflowY: 'auto',
    maxHeight: 'calc(90vh - 80px)',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.grey[100],
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.grey[400],
      borderRadius: '4px',
      '&:hover': {
        background: theme.palette.grey[500],
      },
    },
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    textAlign: 'center',
    flex: 1,
  },
  plansContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      gridTemplateColumns: '1fr',
    },
  },
  planCard: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(2),
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  selectedPlan: {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}08`,
    boxShadow: theme.shadows[4],
  },
  currentPlanCard: {
    borderColor: theme.palette.grey[300],
    backgroundColor: theme.palette.grey[50],
  },
  planCardContent: {
    padding: theme.spacing(2.5),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
      paddingBottom: theme.spacing(2.5),
    },
  },
  badge: {
    position: 'absolute',
    top: theme.spacing(-1),
    right: theme.spacing(2),
    zIndex: 1,
  },
  planHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  planDescription: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    lineHeight: 1.3,
    color: theme.palette.text.primary,
  },
  planPrice: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.4,
  },
  orderDetailsCard: {
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
  },
  orderTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  orderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  orderLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  orderValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textAlign: 'right',
  },
  orderDescription: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  totalLabel: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  totalValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  infoBox: {
    display: 'flex',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light + '10',
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.info.light}30`,
    marginTop: theme.spacing(2),
  },
  infoIcon: {
    color: theme.palette.info.main,
    fontSize: '1.25rem',
  },
  infoText: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  },
  upgradeButton: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(1.75),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: theme.spacing(1.5),
    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}));

const PlanUpgradeDialogV2 = ({ open, onClose, currentPlanId, userEmail }) => {
  const { classes, cx } = useStyles();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

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
        // Default select the next higher plan or the highest if current is highest
        const currentPlanIndex = data.plans.findIndex(p => p.id === currentPlanId);
        if (currentPlanIndex !== -1 && currentPlanIndex < data.plans.length - 1) {
          setSelectedPlan(data.plans[currentPlanIndex + 1]);
        } else if (currentPlanIndex === data.plans.length - 1) {
          setSelectedPlan(data.plans[currentPlanIndex]);
        }
      } else {
        throw new Error('Failed to load plans');
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Unable to load subscription plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [open, currentPlanId]);

  const handleUpgrade = async () => {
    if (!selectedPlan || selectedPlan.id === currentPlanId) return;

    try {
      setProcessing(true);
      setError(null);

      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          email: userEmail,
          metadata: {
            upgradeFrom: currentPlanId,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.sessionUrl;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError('Unable to process upgrade. Please try again.');
      setProcessing(false);
    }
  };

  const currentPlan = plans.find(p => p.id === currentPlanId);
  const calculateSavings = (plan) => {
    if (!currentPlan) return null;
    const priceDiff = plan.price - currentPlan.price;
    if (priceDiff <= 0) return null;
    const savingsPercent = Math.round((priceDiff / plan.price) * 100);
    return savingsPercent > 0 ? savingsPercent : null;
  };

  const calculateOrderDetails = () => {
    if (!selectedPlan || !currentPlan) return null;

    const basePrice = selectedPlan.price;
    const proratedCredit = selectedPlan.id === currentPlanId ? 0 : 0; // Simplified - would calculate actual proration
    const subtotal = basePrice - proratedCredit;
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% tax example
    const total = subtotal + tax;
    const appliedBalance = 0; // Would fetch from account balance
    const dueToday = total - appliedBalance;

    return {
      basePrice,
      proratedCredit,
      subtotal,
      tax,
      total,
      appliedBalance,
      dueToday,
    };
  };

  const orderDetails = calculateOrderDetails();

  const getNextBillingDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} className={classes.dialog}>
        <Box className={classes.loadingContainer}>
          <CircularProgress />
        </Box>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth className={classes.dialog}>
      <Box className={classes.header}>
        <IconButton onClick={onClose} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography className={classes.title}>
          Adjust usage
        </Typography>
      </Box>

      <DialogContent className={classes.content}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Plan Selection */}
        <Box className={classes.plansContainer}>
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const isSelected = selectedPlan?.id === plan.id;
            const savings = calculateSavings(plan);

            return (
              <Card
                key={plan.id}
                className={cx(classes.planCard, {
                  [classes.selectedPlan]: isSelected && !isCurrent,
                  [classes.currentPlanCard]: isCurrent,
                })}
                onClick={() => !isCurrent && setSelectedPlan(plan)}
                elevation={0}
              >
                {isCurrent && (
                  <Chip
                    label="Current plan"
                    size="small"
                    className={classes.badge}
                  />
                )}
                {!isCurrent && savings && (
                  <Chip
                    label={`Save ${savings}%`}
                    color="primary"
                    size="small"
                    className={classes.badge}
                  />
                )}

                <CardContent className={classes.planCardContent}>
                  <Box className={classes.planHeader}>
                    <Box flex={1}>
                      <Typography className={classes.planName}>
                        {plan.name}
                      </Typography>
                      <Typography className={classes.planDescription}>
                        Up to {plan.deviceLimit} devices
                      </Typography>
                      <Typography className={classes.planPrice}>
                        USD {plan.price.toFixed(2)}/month + tax
                      </Typography>
                    </Box>
                    <Radio
                      checked={isSelected || isCurrent}
                      disabled={isCurrent}
                      color="primary"
                    />
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Order Details */}
        {selectedPlan && orderDetails && (
          <Box className={classes.orderDetailsCard}>
            <Typography className={classes.orderTitle}>
              Order details
            </Typography>

            <Box className={classes.orderRow}>
              <Box>
                <Typography className={classes.orderLabel}>
                  {selectedPlan.name}
                </Typography>
                <Typography className={classes.orderDescription}>
                  Up to {selectedPlan.deviceLimit} devices
                </Typography>
              </Box>
              <Typography className={classes.orderValue}>
                USD {orderDetails.basePrice.toFixed(2)}
              </Typography>
            </Box>

            {orderDetails.proratedCredit > 0 && (
              <Box className={classes.orderRow}>
                <Box>
                  <Typography className={classes.orderLabel}>
                    Adjustments
                  </Typography>
                  <Typography className={classes.orderDescription}>
                    Prorated credit for the remainder of {currentPlan?.name}
                  </Typography>
                </Box>
                <Typography className={classes.orderValue}>
                  - USD {orderDetails.proratedCredit.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box className={classes.orderRow}>
              <Typography className={classes.orderLabel}>
                Subtotal
              </Typography>
              <Typography className={classes.orderValue}>
                USD {orderDetails.subtotal.toFixed(2)}
              </Typography>
            </Box>

            <Box className={classes.orderRow}>
              <Typography className={classes.orderLabel}>
                Tax
              </Typography>
              <Typography className={classes.orderValue}>
                USD {orderDetails.tax.toFixed(2)}
              </Typography>
            </Box>

            <Box className={classes.orderRow}>
              <Typography className={classes.orderLabel}>
                Total
              </Typography>
              <Typography className={classes.orderValue}>
                USD {orderDetails.total.toFixed(2)}
              </Typography>
            </Box>

            {orderDetails.appliedBalance > 0 && (
              <Box className={classes.orderRow}>
                <Typography className={classes.orderLabel}>
                  Applied balance
                </Typography>
                <Typography className={classes.orderValue}>
                  -USD {orderDetails.appliedBalance.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box className={classes.totalRow}>
              <Typography className={classes.totalLabel}>
                Total due today
              </Typography>
              <Typography className={classes.totalValue}>
                USD {orderDetails.dueToday.toFixed(2)}
              </Typography>
            </Box>

            <Box className={classes.infoBox}>
              <InfoIcon className={classes.infoIcon} />
              <Typography className={classes.infoText}>
                Your subscription will auto renew on {getNextBillingDate()}. You will be charged USD {selectedPlan.price.toFixed(2)}/month + tax.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Upgrade Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          className={classes.upgradeButton}
          onClick={handleUpgrade}
          disabled={!selectedPlan || selectedPlan.id === currentPlanId || processing}
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <TrendingUpIcon />}
        >
          {processing ? 'Processing...' : selectedPlan?.id === currentPlanId ? 'Current Plan' : 'Confirm Upgrade'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeDialogV2;
