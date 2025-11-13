import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextField, Typography, Snackbar, IconButton, Alert, CircularProgress, Box, Stepper, Step, StepLabel,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import { snackBarDurationShortMs } from '../common/util/duration';
import { useCatch, useEffectAsync } from '../reactHelper';
import { sessionActions } from '../store';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';
import PlanSelection from '../components/billing/PlanSelection';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  expandedContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'auto',
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
    zIndex: 1000,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: theme.spacing(3),
    fontWeight: 500,
    marginLeft: theme.spacing(1),
    textTransform: 'uppercase',
  },
  stepper: {
    marginBottom: theme.spacing(3),
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  planSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

const RegisterPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const server = useSelector((state) => state.session.server);
  const totpForce = useSelector((state) => state.session.server.attributes.totpForce);

  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpKey, setTotpKey] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = ['Account Details', 'Select Plan', 'Complete'];

  useEffectAsync(async () => {
    if (totpForce) {
      const response = await fetchOrThrow('/api/users/totp', { method: 'POST' });
      setTotpKey(await response.text());
    }
  }, [totpForce, setTotpKey]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate account details
      if (!name || !password || !(server.newServer || /(.+)@(.+)\.(.{2,})/.test(email))) {
        setError('Please fill in all required fields correctly');
        return;
      }
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleSubmit = useCatch(async (event) => {
    event.preventDefault();

    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create Stripe checkout session
      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
      const response = await fetch(`${billingApiUrl}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          email,
          metadata: {
            userName: name,
            temporaryPassword: password,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Store user data temporarily for after payment
      sessionStorage.setItem('pendingRegistration', JSON.stringify({
        name,
        email,
        password,
        totpKey,
        planId: selectedPlan.id,
      }));

      // Redirect to Stripe Checkout
      window.location.href = data.sessionUrl;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to initiate checkout. Please try again.');
      setLoading(false);
    }
  });

  // For plan selection step, break out of LoginLayout constraints
  if (activeStep === 1) {
    return (
      <div className={classes.expandedContainer}>
        <Box maxWidth="1400px" margin="0 auto">
          <div className={classes.header}>
            <IconButton color="primary" onClick={handleBack}>
              <BackIcon />
            </IconButton>
            <Typography className={classes.title} color="primary">
              {t('loginRegister')}
            </Typography>
          </div>

          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <div className={classes.planSection}>
            <PlanSelection
              selectedPlan={selectedPlan}
              onPlanSelect={handlePlanSelect}
              required
            />
            <div className={classes.buttonGroup}>
              <Button
                variant="outlined"
                onClick={handleBack}
                size="large"
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!selectedPlan}
                size="large"
                fullWidth
              >
                Next
              </Button>
            </div>
          </div>
        </Box>
      </div>
    );
  }

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          {!server.newServer && activeStep === 0 && (
            <IconButton color="primary" onClick={() => navigate('/login')}>
              <BackIcon />
            </IconButton>
          )}
          <Typography className={classes.title} color="primary">
            {t('loginRegister')}
          </Typography>
        </div>

        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <div className={classes.formSection}>
            <TextField
              required
              label={t('sharedName')}
              name="name"
              value={name}
              autoComplete="name"
              autoFocus
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              required
              type="email"
              label={t('userEmail')}
              name="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              required
              label={t('userPassword')}
              name="password"
              value={password}
              type="password"
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            {totpForce && (
              <TextField
                required
                label={t('loginTotpKey')}
                name="totpKey"
                value={totpKey || ''}
                InputProps={{
                  readOnly: true,
                }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              fullWidth
            >
              Next
            </Button>
          </div>
        )}

        {activeStep === 2 && (
          <div className={classes.formSection}>
            <Box sx={{
              p: 4,
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              backgroundColor: 'background.paper',
            }}>
              <Typography variant="h5" gutterBottom fontWeight={600} color="primary" sx={{ mb: 3 }}>
                Registration Summary
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Name:</Typography>
                  <Typography variant="body1" fontWeight={600}>{name}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" color="textSecondary">Email:</Typography>
                  <Typography variant="body1" fontWeight={600}>{email}</Typography>
                </Box>

                <Box sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                  color: 'primary.contrastText',
                }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {selectedPlan?.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1">
                      Up to {selectedPlan?.deviceLimit} devices
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      ${selectedPlan?.price}<Typography component="span" variant="body2">/month</Typography>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Next Steps:
              </Typography>
              <Typography variant="body2">
                You'll be redirected to Stripe's secure payment page. After successful payment,
                your account will be created automatically with the selected plan.
              </Typography>
            </Alert>

            <div className={classes.buttonGroup}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
                size="large"
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                fullWidth
              >
                {loading ? (
                  <Box className={classes.loadingContainer}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Processing...</span>
                  </Box>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          dispatch(sessionActions.updateServer({ ...server, newServer: false }));
          navigate('/login');
        }}
        autoHideDuration={snackBarDurationShortMs}
        message={t('loginCreated')}
      />
    </LoginLayout>
  );
};

export default RegisterPage;
