import { Card, CardContent, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Box, Chip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: theme.spacing(2),
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: theme.shadows[12],
      border: `2px solid ${theme.palette.primary.light}`,
    },
  },
  selectedCard: {
    border: `3px solid ${theme.palette.primary.main}`,
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
    backgroundColor: theme.palette.action.hover,
  },
  popularCard: {
    border: `2px solid ${theme.palette.secondary.main}`,
  },
  popularBadge: {
    position: 'absolute',
    top: theme.spacing(-1.5),
    right: theme.spacing(2),
    zIndex: 1,
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3),
  },
  planName: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
    textAlign: 'center',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  price: {
    fontSize: '3.5rem',
    fontWeight: 700,
    color: theme.palette.primary.main,
    lineHeight: 1,
  },
  period: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '1rem',
  },
  deviceLimit: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(1),
    textAlign: 'center',
  },
  featuresList: {
    flexGrow: 1,
    marginBottom: theme.spacing(3),
    paddingLeft: 0,
  },
  featureItem: {
    padding: theme.spacing(1, 0),
  },
  featureIcon: {
    minWidth: theme.spacing(4),
    color: theme.palette.success.main,
  },
  selectButton: {
    padding: theme.spacing(1.5),
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
}));

const PlanCard = ({ plan, selected, onSelect, popular }) => {
  const { classes, cx } = useStyles();

  return (
    <Card
      className={cx(classes.card, {
        [classes.selectedCard]: selected,
        [classes.popularCard]: popular && !selected,
      })}
      elevation={selected || popular ? 4 : 2}
      onClick={() => onSelect(plan)}
    >
      {popular && (
        <Chip
          label="Most Popular"
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
          <Typography variant="h6" fontWeight={600}>
            Up to {plan.deviceLimit} devices
          </Typography>
        </Box>

        <List className={classes.featuresList} dense disablePadding>
          {plan.features.map((feature, index) => (
            <ListItem key={index} className={classes.featureItem} disableGutters>
              <ListItemIcon className={classes.featureIcon}>
                <CheckCircleIcon />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        <Button
          variant={selected ? 'contained' : 'outlined'}
          color="primary"
          fullWidth
          size="large"
          className={classes.selectButton}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plan);
          }}
        >
          {selected ? '✓ Selected' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanCard;
