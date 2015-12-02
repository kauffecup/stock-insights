//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import objectAssign from 'object-assign';

var vcapServices;
// if running in Bluemix, use the environment variables
if (process.env.VCAP_SERVICES) {
  vcapServices = JSON.parse(process.env.VCAP_SERVICES);
// otherwise use our JSON file
} else {
  try {
    vcapServices = require('./VCAP_SERVICES.json');
  } catch (e) {
    console.error(e);
  }
}

var envVars = {
  BYPASS_URL: process.env.BYPASS_URL,
  BYPASS_UN: process.env.BYPASS_UN,
  BYPASS_PW: process.env.BYPASS_PW
};
try {
  envVars = require('./ENV_VARS.json');
} catch (e) {
  console.error(e);
}

// the keys are complex, for example: `Company Lookup v1 : Sandbox 55e768c90cf2722940e66db9 prod`
// iterate over the keys and convert to companyLookup, stockPrice, stockNews, stockHistory,
// stockSentiment, globalization, and stockTweets, for easier use throughout the application
for (var service in vcapServices) {
  if (service.indexOf('Company Lookup') > -1) {
    vcapServices.companyLookup = vcapServices[service][0];
    delete vcapServices[service];
  } else if (service.indexOf('Stock Price') > -1) {
    vcapServices.stockPrice = vcapServices[service][0];
    delete vcapServices[service];
  } else if (service.indexOf('Stock News') > -1) {
    vcapServices.stockNews = vcapServices[service][0];
    delete vcapServices[service];
  } else if (service.indexOf('Stock History') > -1) {
    vcapServices.stockHistory = vcapServices[service][0];
    delete vcapServices[service];
  } else if (service.indexOf('Stock Sentiment') > -1) {
    vcapServices.stockSentiment = vcapServices[service][0];
    delete vcapServices[service];
  } else if (service.indexOf('gp-beta') > -1) {
    vcapServices.globalization = vcapServices[service][0];
  } else if (service.indexOf('Stock Tweets') > -1) {
    vcapServices.stockTweets = vcapServices[service][0];
  }
}

export default objectAssign(envVars, vcapServices);
