var { CONFIG_REFRESH_EVENT, default: ConfigClient } = require('nodecloud-config-client');
var process = require('process');
let localconfig = require('config');
var events = require('events');
var eventEmitter = new events.EventEmitter();

const applicationName = localconfig.applicationname;
const refreshinterval = localconfig.configrefreshinterval;
var configData = null;
var configServerUri = process.argv[2];
var envProfile = process.argv[3];
const SLASH = '/';

if (configServerUri == null || envProfile == null || applicationName == null) {
  throw Error('config-manager error: ConfigconfigServerUri, envProfile, applicationName mandatory');
}

var url = configServerUri + SLASH + applicationName + SLASH + envProfile;
var client = new ConfigClient({
  remote: {
    url: url,
    service: applicationName,
    interval: refreshinterval,
    watch: true
  }
});

//eslint-disable-next-line no-unused-vars
client.on(CONFIG_REFRESH_EVENT, config => {
  client.getConfig().then(cfg => {
    configData = cfg.config;
    eventEmitter.emit('refreshedConfig', configData);
  });
});


async function getConfigData() {
  return new Promise((resolve) => {
    client.getConfig().then(cfg => {
      configData = cfg.config;
      resolve(configData);
    });
  });
}

module.exports.eventEmitter = eventEmitter;
module.exports.getConfigData = getConfigData;
