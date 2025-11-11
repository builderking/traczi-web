import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Button, Paper,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LoginLayout from './LoginLayout';
import { useTranslation } from '../common/components/LocalizationProvider';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
  },
  icon: {
    fontSize: theme.spacing(8),
  },
  successIcon: {
    color: theme.palette.success.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));

const RegistrationSuccessPage = () => {
  const { classes, cx } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setMessage('No session ID provided. Registration may not have completed.');
        return;
      }

      try {
        // Retrieve credentials from sessionStorage
        const pendingReg = sessionStorage.getItem('pendingRegistration');
        let userCredentials = null;
        if (pendingReg) {
          const regData = JSON.parse(pendingReg);
          userCredentials = {
            email: regData.email,
            password: regData.password,
          };
          setCredentials(userCredentials);
        }

        // Fetch session details from billing middleware
        const billingApiUrl = import.meta.env.VITE_BILLING_API_URL || 'https://traczi-billing.onrender.com';
        const response = await fetch(`${billingApiUrl}/billing/session/${sessionId}`);
        const data = await response.json();

        if (data.success && data.session.status === 'complete') {
          setSessionData(data.session);
          setStatus('success');
          setMessage('Your account has been created successfully! You can now log in with your credentials.');

          // Keep credentials in state but clear from sessionStorage after a delay
          setTimeout(() => {
            if (pendingReg) {
              sessionStorage.removeItem('pendingRegistration');
            }
          }, 60000); // Clear after 1 minute

          // Auto-redirect to login after 5 seconds
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Error verifying session:', err);
        setStatus('error');
        setMessage('Unable to verify payment status. Please contact support if you were charged.');
      }
    };

    verifySession();
  }, [searchParams, navigate]);

  return (
    <LoginLayout>
      <Box className={classes.container}>
        <Paper className={classes.paper} elevation={3}>
          {status === 'loading' && (
            <>
              <CircularProgress size={60} />
              <Typography variant="h5" className={classes.title}>
                Verifying Payment...
              </Typography>
              <Typography variant="body1" className={classes.message}>
                Please wait while we confirm your registration.
              </Typography>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircleIcon className={cx(classes.icon, classes.successIcon)} />
              <Typography variant="h4" className={classes.title} color="primary">
                Registration Complete!
              </Typography>
              <Typography variant="body1" className={classes.message}>
                {message}
              </Typography>

              {credentials && (
                <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Your Login Credentials:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Email:</strong> {credentials.email}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Password:</strong> {credentials.password}
                  </Typography>
                  <Typography variant="caption" color="warning.main" sx={{ mt: 2, display: 'block' }}>
                    ⚠️ Please save these credentials! This is the only time your password will be displayed.
                  </Typography>
                </Alert>
              )}

              {sessionData && (
                <Alert severity="success" sx={{ width: '100%' }}>
                  <Typography variant="body2">
                    <strong>Plan:</strong> {sessionData.metadata?.planId?.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Device Limit:</strong> {sessionData.metadata?.deviceLimit} devices
                  </Typography>
                </Alert>
              )}

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                You will be redirected to the login page in 5 seconds...
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/login')}
                fullWidth
                sx={{ mt: 2 }}
              >
                Go to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <ErrorIcon className={cx(classes.icon, classes.errorIcon)} />
              <Typography variant="h5" className={classes.title} color="error">
                Registration Error
              </Typography>
              <Typography variant="body1" className={classes.message}>
                {message}
              </Typography>
              <Alert severity="error" sx={{ width: '100%' }}>
                If you were charged but your account was not created, please contact support
                with your order details.
              </Alert>
              <div className={classes.buttonGroup}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  fullWidth
                >
                  Try Again
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  fullWidth
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </Paper>
      </Box>
    </LoginLayout>
  );
};

export default RegistrationSuccessPage;
