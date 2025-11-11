import { useState, useEffect } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import PlanCard from './PlanCard';
import { useEffectAsync } from '../../reactHelper';
import fetchOrThrow from '../../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  title: {
    fontWeight: 700,
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
  },
  plansGrid: {
    display: 'flex',
    gap: theme.spacing(3),
    justifyContent: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
  planWrapper: {
    flex: '1 1 0',
    minWidth: '280px',
    maxWidth: '380px',
    [theme.breakpoints.down('md')]: {
      maxWidth: '100%',
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
}));

const PlanSelection = ({ selectedPlan, onPlanSelect, required = false }) => {
  const { classes } = useStyles();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffectAsync(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch plans from billing middleware
      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetchOrThrow(`${billingApiUrl}/billing/plans`);
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
  }, []);

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.title} variant="h3" component="h2" color="primary">
          Choose Your Plan{required && ' *'}
        </Typography>
        <Typography className={classes.subtitle}>
          Select the perfect plan for your tracking needs
        </Typography>
      </Box>

      <Box className={classes.plansGrid}>
        {plans.map((plan, index) => (
          <Box key={plan.id} className={classes.planWrapper}>
            <PlanCard
              plan={plan}
              selected={selectedPlan?.id === plan.id}
              onSelect={onPlanSelect}
              popular={index === 1} // Mark middle plan as popular
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PlanSelection;
