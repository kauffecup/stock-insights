# Stock Insights

## Initial Set Up

  1. Create a Node.js runtime
  1. Add the custom "Company Lookup" API
  1. Add the custom "Stock Price" API

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
   ]
}
```

Then you only need to run:

```sh
npm install
npm run dev
npm start
```

Running `npm run dev` kicks off the `gulp dev` task, which in turn kicks off a
`watchify` on your client-side JS that will rebuild every time you save, and
also watches all `.less` files and compiles those when you save.

`npm start` kicks off a `babel-node` process on `server/app.js`. This allows us
to write the server code in ES6.