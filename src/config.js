const dev = {
  STRIPE_KEY: "YOUR_STRIPE_DEV_PUBLIC_KEY",
  s3: {
    REGION: "us-east-2",
    BUCKET: "aces-uploads"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://tm3yqbv3yi.execute-api.us-east-2.amazonaws.com/dev"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_egwqWK6CX",
    APP_CLIENT_ID: "tlp82v25e2p38elgfrhe0k56v",
    IDENTITY_POOL_ID: "us-east-2:c57c0773-c0ab-49e2-9a42-3f90cd7855fa"
  },

  mapbox: {
    TOKEN: "pk.eyJ1IjoieWh1YW5nNyIsImEiOiJjazJocjliaWEwdnd6M2hxZ2FnNHM3cDkwIn0.UQxOTkmbQTAv-e9El4zLKQ",
    STREET_STYLE: "mapbox://styles/yhuang7/ck6nudp1h1am11intobzjm1em",
    SATELLITE_STYLE: "mapbox://styles/yhuang7/ck7sem6mk2mi61imk9yqls0un",
    TRANSITION_DURATION: 0,
  },

  projectStatus: {
    PLAN: 1,
    DESIGN: 2,
    EVALUATION: 3,
    DEPLOYMENT: 4,
    DATA: 5,
    OTHER: 6,
    ARCHIVE: 99
  }
};


const prod = {
  STRIPE_KEY: "YOUR_STRIPE_PROD_PUBLIC_KEY",
  s3: {
    REGION: "us-east-2",
    BUCKET: "aces-uploads"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://tm3yqbv3yi.execute-api.us-east-2.amazonaws.com/dev"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_egwqWK6CX",
    APP_CLIENT_ID: "tlp82v25e2p38elgfrhe0k56v",
    IDENTITY_POOL_ID: "us-east-2:c57c0773-c0ab-49e2-9a42-3f90cd7855fa"
  },

  mapbox: {
    TOKEN: "pk.eyJ1IjoieWh1YW5nNyIsImEiOiJjazJocjliaWEwdnd6M2hxZ2FnNHM3cDkwIn0.UQxOTkmbQTAv-e9El4zLKQ",
    STREET_STYLE: "mapbox://styles/yhuang7/ck6nudp1h1am11intobzjm1em",
    SATELLITE_STYLE: "mapbox://styles/yhuang7/ck7sem6mk2mi61imk9yqls0un",
    TRANSITION_DURATION: 0,
  },

  projectStatus: {
    PLAN: 1,
    DESIGN: 2,
    EVALUATION: 3,
    DEPLOYMENT: 4,
    DATA: 5,
    OTHER: 6,
    ARCHIVE: 99
  }
};

// Default to dev if not set
const config = process.env.REACT_APP_STAGE === 'prod'
  ? prod
  : dev;

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 5000000,
  ...config
};