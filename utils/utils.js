const getUuid = require('uuid-by-string');
const datetime = require('node-datetime');
const fs = require('fs');

//export methods

module.exports.generateTxnID = function () {
   return getUuid(this.getTimestamp() + "");
}

module.exports.getTimestamp = function () {
   let dt = datetime.create();
   return dt._created;
}

module.exports.getCurrentDateTime = function () {
   let dt = datetime.create();
   return dt._now;
}

module.exports.getElapsedTime = function (starttime, endtime) {
   if (starttime != null && endtime != null) {
      var difftime = (endtime - starttime) + 'ms';
      return difftime;
   } else {
      return null;
   }
}

module.exports.getSecret = function (secretName) {
   let secretValue = fs.readFileSync(secretName);
   return secretValue;
}

module.exports.exitApp = function () {
   // eslint-disable-next-line no-undef
   process.exit(1);
}