# Stock Insights

## Initial Set Up

  1. Create a Node.js runtime
  1. Add the custom "Company Lookup" API
  1. Add the custom "Stock Price" API
  1. Add the custom "Stock News" API
  1. Add the custom "Stock History" API
  1. Add the custom "Stock Sentiment" API
  1. Add the custom "Stock Tweets" API
  1. Add the "IBM Globalization" service

## Running Locally

To run locally, create a `VCAP_SERVICES.json` file in the `server` directory
that is identical to your deployed environment variables. For example:

```json
{
   "Company Lookup v1 : Sandbox 55e768c90cf2722940e66db9 prod": [
      {
         "name": "CompanyLookup",
         "label": "Company Lookup v1 : Sandbox 55e768c90cf2722940e66db9 prod",
         "plan": "Basic Stock Services v1 : Sandbox prod",
         "credentials": {
            "client_id": "your_client_id",
            "client_secret": "your_client_secret",
            "url": "your_client_url"
         }
      }
   ],
   "Stock Price v1 : Sandbox prod": [
      {
         "name": "StockPrice",
         "label": "Stock Price v1 : Sandbox prod",
         "plan": "Basic Stock Services v1 : Sandbox prod",
         "credentials": {
            "client_id": "your_client_id",
            "client_secret": "your_client_secret",
            "url": "your_client_url"
         }
      }
   ],
   ...
}
```

Where the `...` represents the JSON for `Stock News`, `Stock History`, and
`Stock Sentiment`.

Then you only need to run:

```sh
npm install
npm run dev
```

Running `npm run dev` adds the Webpack dev and hot middleware to the server.
These are used to serve the bundle. It also handles rebuilding the bundle on js
or css changes, and "hot reloading" them into your page. Access the server at
localhost:3000
