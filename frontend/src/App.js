import logo from './logo.svg';
import './App.css';
import Map from './Map';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, CardHeader, Grid } from '@material-ui/core';
import VacMap from './VacMap';
import Table from './Table';
import Form from './Form';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    height: '100%',
    minHeight: '21rem'
  },
  card: {
    height: '75vh',
    position: 'relative'
  },
  CardContent: {
    width: '100%',
    height: '100%',

  }
}));

function App() {
  const classes = useStyles();
  return (
    <div className="App">
      <div class="container-fluid">
        <div class="row">
          <div className="col-xl-6" id="displayMap">
            <div className="card mb-4">
              <div className="card-header"><i className="fas fa-chart-bar mr-1"></i>By Map</div>
              <div className="card-body p-0">
                <Map />
                <div id="map-overlay"></div>
              </div>
            </div>
          </div>

          <div className="col-xl-6" id="displayMap">
            <div className="card mb-4">
              <div className="card-header"><i className="fas fa-chart-bar mr-1"></i>By Map</div>
              <div className="card-body p-0">
                <VacMap />
                <div id="map-overlay"></div>
              </div>
            </div>
          </div>
        </div>
        <Table/>
        <Form/>
      </div>
      {/* <Grid container rowSpacing={1}>
        <Grid item xs={6}>
          <Card className={classes.card}>
            <CardHeader
              title="Shrimp and Chorizo Paella"
              subheader="September 14, 2016"
            />
            <CardContent className={classes.CardContent}>
              <Map />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card className={classes.card}>
            <CardHeader
              title="Shrimp and Chorizo Paella"
              subheader="September 14, 2016"
            />
            <CardContent className={classes.CardContent}>
              <VacMap />
            </CardContent>
          </Card>
        </Grid>

      </Grid> */}

    </div>
  );
}


export default App;
