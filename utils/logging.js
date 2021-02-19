/* eslint-disable no-console */
const util = require('./utils');
var process = require('process');

var cfgmgr;
var enableLogFormat = true
var logbase;
if (process.argv.length > 4) {
  cfgmgr = require('./ConfigManager');
  setLogBase(cfgmgr);
} else {
  cfgmgr = require('./CloudConfigManager');
  var eventEmitter = cfgmgr.eventEmitter;
  cfgmgr.getConfigData().then((data) => {
    setLogBase(data);
  }).catch((err) => {
    console.log(err);
    util.exitApp()
  });
}

if (eventEmitter) {
  eventEmitter.on('refreshedConfig', function (data) {
    setLogBase(data);
  });
}

function setLogBase(configManagerObj) {
  logbase = {
    "LogEntry": configManagerObj.log.LogEntry,
    "logLevel": configManagerObj.log.logLevel,
    "organization": configManagerObj.log.organization,
    "environment": configManagerObj.log.environment,
    "microservice": configManagerObj.log.microservice,
    "revision": configManagerObj.log.revision,
    "ApplicationID": configManagerObj.log.ApplicationID,
    "entrypointORMicroserviceUrl": configManagerObj.log.entrypointORMicroserviceUrl,
    "backendURL": configManagerObj.log.backendURL
  }
}

var logTemp = 'LogEntry##{logType}##{time}##{organization}##{environment}##{microservice}##{revision}##{transactionId}##{CorrelationID}##{ApplicationID}##{verbORaction}##{entrypointORMicroserviceUrl}##{backendURL}##{httpCodeORerrorCode}##{faultNameORcodeName}##{Message}##{priority}##{elapsedTime}##{internalErrorCode}##{internalErrorCodeDesc}##'

var prepareLog = function (logType, applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc) {
  let data = { ...logbase };

  if (applicationId != null) {
    data.ApplicationID = applicationId;
  }
  data.logType = logType;
  data.CorrelationID = correlationId;
  data.transactionId = transactionId;
  data.priority = priority;
  data.verbORaction = action;
  data.httpCodeORerrorCode = code;
  data.faultNameORcodeName = codename;
  data.Message = msg;
  data.time = util.getCurrentDateTime();
  data.elapsedTime = elapsedTime;
  data.internalErrorCode = internalErrorCode;
  data.internalErrorCodeDesc = internalErrorCodeDesc;

  return (enableLogFormat == true ? replaceMsg(data) : msg);
}

var replaceMsg = function (data) {
  var logTempNew = logTemp;
  Object.keys(data).forEach(function (key) {
    logTempNew = logTempNew.replace("{" + key + "}", data[key] != null ? data[key] : "");
  })
  return logTempNew
}

module.exports.logInfo = function (applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc) {
  let data = { ...logbase };

  let allowedLogLevels = 'Info,Debug';
  let logType = "Info";
  if (!allowedLogLevels.includes(data.logLevel)) {
    return;
  } else {
    console.log(prepareLog(logType, applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc));
  }
};

module.exports.logDebug = function (applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc) {
  let data = { ...logbase };

  let allowedLogLevels = 'Debug';
  let logType = "Debug";
  if (!allowedLogLevels.includes(data.logLevel)) {
    return;
  } else {
    console.log(prepareLog(logType, applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc));
  }
};

module.exports.logError = function (applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc, error) {
  let data = { ...logbase };

  let allowedLogLevels = 'Info,Debug,Error';
  let logType = "Error";
  if (!allowedLogLevels.includes(data.logLevel)) {
    return;
  } else {
    if (msg.indexOf('%s') > -1) {
      console.log(prepareLog(logType, applicationId, correlationId, transactionId, priority, action, code, codename, msg, elapsedTime, internalErrorCode, internalErrorCodeDesc), error !== null ? error.message : '');
    } else {
      console.log(prepareLog(logType, applicationId, correlationId, priority, action, code, codename, msg + (error !== null ? ':' + error.message : ''), elapsedTime, internalErrorCode, internalErrorCodeDesc));
      console.log(error);
    }
  }
};
