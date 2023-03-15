const prod = {
  STRIPE_KEY: "",

  s3: {
    REGION: "us-east-2",
    BUCKET: "flaces-api-prod-uploadsbucket-zya45vuprjuk"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://t1rf39oqug.execute-api.us-east-2.amazonaws.com/prod"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_ad1pJ31RA",
    APP_CLIENT_ID: "2317lnbfm9om1p88le5okgf7ql",
    IDENTITY_POOL_ID: "us-east-2:2ceeb531-fb4f-4f47-84de-49f8f6454fb0"
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
const config = prod;

export default {
  // Add common config values here
  MAX_ATTACHMENT_SIZE: 5000000,
  ...config
};