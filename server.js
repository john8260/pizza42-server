const express = require('express');
const app = express();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const morgan = require('morgan');
var data = require('./data');
require('dotenv').config();


// if (!process.env.REACT_APP_DOMAIN || !process.env.AUTH0_AUDIENCE) {
//   throw 'Make sure you have AUTH0_DOMAIN, and AUTH0_AUDIENCE in your .env file'
// }

app.use(cors());
app.use(morgan('API Request (port 5000): :method :url :status :response-time ms - :res[content-length]'));

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://john8260.au.auth0.com/.well-known/jwks.json`
  }), 

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://john8260.au.auth0.com/`,
  algorithms: ['RS256']
});

const checkScopes = jwtAuthz([ 'read:messages' ]);

app.get('/api/products', function(req, res) {
  res.json({ products: data.pizzas });
});

app.get('/api/private', checkJwt, checkScopes, function(req, res) {
  res.json({ message: "response from API: OK ", code: 200 });
});

app.listen(8080);
console.log('Server listening on http://localhost:8080. The React app will be built and served at http://localhost:8080.');
