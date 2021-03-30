require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 3 });
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const data = require("./data");

app.use(cors({ origin: true }));

app.use(
  morgan(
    "API Request (port " +
    (process.env.PORT || 5000) +
    "): :method :url :status :response-time ms - :res[content-length]"
  )
);

app.use(express.json());

app.get("/api/products", function (req, res) {
  res.json({ products: data.pizzas });
});

app.post("/api/create_payment_intent", async (req, res) => {
  const { amount, email } = req.body;
  const options = {
    amount: amount,
    currency: 'aud',
    metadata: { integration_check: "accept_a_payment" },
    receipt_email: email
  };
  try {
    const paymentIntent = await stripe.paymentIntents.create(options);
    res.status(200).send(paymentIntent.client_secret);
  } catch (error) {
    res.status(500).json(
      {
        statusCode: 500,
        message: `Something happened! ${error.message}`
      });
  }
});

app.post("/webhooks", async (req, res) => {
  let data = req.body.data;
  let eventType = req.body.type;

  // Handle the event
  switch (eventType) {
    case 'payment_intent.succeeded':
      // Fulfill any orders, e-mail receipts, update DB, etc
      console.log(`💰 Payment from ${data.object.receipt_email} received! Total Amount: $${data.object.amount / 100}`);
      break;
    default:
      console.log(`⚠️ Unexpected event type ${eventType}`);
      res.status(400).json(
        {
          statusCode: 400,
          message: `Unexpected event type ${eventType}`
        });
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

app.listen(process.env.PORT || 5000);
console.log("Server listening on http://localhost:%d.", process.env.PORT || 5000);
