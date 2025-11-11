import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button, TextField, Typography, Snackbar, IconButton, Alert, CircularProgress, Box, Stepper, Step, StepLabel,
  Card, CardContent, Fade, InputAdornment,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
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
    gap: theme.spacing(1.5),
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.25),
  },
  stepper: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(1.5, 0),
    '& .MuiStepLabel-label': {
      fontSize: '0.85rem',
      fontWeight: 500,
    },
    '& .MuiStepLabel-label.Mui-active': {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
    '& .MuiStepIcon-root': {
      fontSize: '1.75rem',
    },
    '& .MuiStepIcon-root.Mui-active': {
      color: theme.palette.primary.main,
    },
    '& .MuiStepIcon-root.Mui-completed': {
      color: theme.palette.success.main,
    },
  },
  formCard: {
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1.5),
      transition: 'all 0.2s ease',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
        },
      },
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
    },
  },
  planSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  button: {
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    },
  },
  primaryButton: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    },
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  summaryCard: {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'hidden',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  detailValue: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: theme.palette.text.primary,
  },
  planCard: {
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
  },
  planHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  priceDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(0.5),
  },
  infoAlert: {
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.info.light,
    border: `1px solid ${theme.palette.info.main}`,
    padding: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1.5),
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
      const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'http://localhost:4000';
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
            <IconButton color="primary" onClick={handleBack} size="large">
              <BackIcon />
            </IconButton>
            <Box>
              <Typography className={classes.title}>
                {t('loginRegister')}
              </Typography>
              <Typography variant="body2" className={classes.subtitle}>
                Choose the perfect plan for your needs
              </Typography>
            </Box>
          </div>

          <Stepper activeStep={activeStep} className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <Fade in timeout={500}>
            <div className={classes.planSection}>
              <PlanSelection
                selectedPlan={selectedPlan}
                onPlanSelect={handlePlanSelect}
                required
              />
              <Box sx={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className={classes.buttonGroup}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    size="large"
                    fullWidth
                    className={classes.button}
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
                    className={`${classes.button} ${classes.primaryButton}`}
                  >
                    Continue to Summary
                  </Button>
                </div>
              </Box>
            </div>
          </Fade>
        </Box>
      </div>
    );
  }

  return (
    <LoginLayout>
      <div className={classes.container}>
        <div className={classes.header}>
          {!server.newServer && activeStep === 0 && (
            <IconButton color="primary" onClick={() => navigate('/login')} size="large">
              <BackIcon />
            </IconButton>
          )}
          <Box>
            <Typography className={classes.title}>
              {t('loginRegister')}
            </Typography>
            {activeStep === 0 && (
              <Typography variant="body2" className={classes.subtitle}>
                Create your account to get started
              </Typography>
            )}
          </Box>
        </div>

        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            sx={{ borderRadius: 2, mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Fade in timeout={500}>
            <Card className={classes.formCard} elevation={0}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Create Your Account
                  </Typography>
                  <Typography variant="body2" className={classes.subtitle}>
                    Fill in your details to get started
                  </Typography>
                </Box>

                <div className={classes.formSection}>
                  <TextField
                    required
                    label={t('sharedName')}
                    name="name"
                    value={name}
                    autoComplete="name"
                    autoFocus
                    onChange={(event) => setName(event.target.value)}
                    className={classes.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    required
                    type="email"
                    label={t('userEmail')}
                    name="email"
                    value={email}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                    className={classes.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    required
                    label={t('userPassword')}
                    name="password"
                    value={password}
                    type="password"
                    autoComplete="new-password"
                    onChange={(event) => setPassword(event.target.value)}
                    className={classes.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {totpForce && (
                    <TextField
                      required
                      label={t('loginTotpKey')}
                      name="totpKey"
                      value={totpKey || ''}
                      className={classes.textField}
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
                    className={`${classes.button} ${classes.primaryButton}`}
                    size="large"
                  >
                    Continue to Plan Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Fade>
        )}

        {activeStep === 2 && (
          <Fade in timeout={500}>
            <div className={classes.formSection}>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                  Registration Summary
                </Typography>
                <Typography variant="body2" className={classes.subtitle}>
                  Review your information before completing
                </Typography>
              </Box>

              <Card className={classes.summaryCard} elevation={0}>
                <Box className={classes.detailRow}>
                  <Typography className={classes.detailLabel}>
                    Name
                  </Typography>
                  <Typography className={classes.detailValue}>{name}</Typography>
                </Box>
                <Box className={classes.detailRow}>
                  <Typography className={classes.detailLabel}>
                    Email
                  </Typography>
                  <Typography className={classes.detailValue}>{email}</Typography>
                </Box>
              </Card>

              <Box className={classes.planCard}>
                <Box className={classes.planHeader}>
                  <Box>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Selected Plan
                    </Typography>
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 0.5 }}>
                      {selectedPlan?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Monthly Price
                    </Typography>
                    <Box className={classes.priceDisplay} sx={{ mt: 0.5 }}>
                      <Typography variant="h5" fontWeight={700}>
                        ${selectedPlan?.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        /month
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Device Limit
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    Up to {selectedPlan?.deviceLimit} devices
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.infoAlert} sx={{ mt: 2 }}>
                <Box sx={{ pt: 0.25 }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#0288d1' }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary', mb: 0.5 }}>
                    Next Steps:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    You'll be redirected to Stripe's secure payment page. After successful payment,
                    your account will be created automatically with the selected plan.
                  </Typography>
                </Box>
              </Box>

              <div className={classes.buttonGroup} style={{ marginTop: '16px' }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  size="large"
                  fullWidth
                  className={classes.button}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  size="large"
                  fullWidth
                  className={`${classes.button} ${classes.primaryButton}`}
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
          </Fade>
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
