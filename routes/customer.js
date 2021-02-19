/**
 * Routing Module for the Biz : " getCustomer API "
 */

var express = require('express');
var customerRouter = express.Router();
const fs = require('fs');
var error = require('./error/error');
let logger = require('../utils/logging');

customerRouter.post('/', function (req, res) {

    // eslint-disable-next-line no-undef
    var dbconnection = global.db;

    try {

        var dbo = dbconnection.db("eapi_data");
        var query = { patientId: req.query["patientId"] };

        dbo.collection("tbf0_patient").find(query).toArray(function (err, result) {

            if (isRequestParamValidationMeat(req, res)) {

                logger.logInfo("MongoDb connection was successfull !!!");

                if (result == null || result.length == 0) {

                    logger.logDebug("Empty Query output... resulting 404 error....");
                    sendErrorCode(res, error.HttpStatusCodes.NOTFOUND);
                }
                else {

                    try {

                        logger.logInfo("Starting API response creation with DB query result !!!");

                        console.log(result);
                        result = buildResponseData(result);
                        logger.logInfo("API " + req.app.locals.serviceName + " response data sucessfully builded !!!");
                        res.send(result);

                    } catch (err) {

                        logger.logDebug("Exception while building API response...resulting 500 error....", err);
                        sendErrorCode(res, error.HttpStatusCodes.GENERICERROR);
                    }
                }
            }

        });
    }
    catch (err) {

        logger.logDebug("Error !!! Unable to establish MongoDb Connection..");
        sendErrorCode(res, error.HttpStatusCodes.BACKENDERROR);
        return;
    }

});

/**
 * 
 *  Function which making API response as expected from MongoDB output query String ,
 *  for the API "v1/pharmacy/patient/"
 */
function buildResponseData(result) {

    // eslint-disable-next-line no-undef
    var contents = fs.readFileSync(__dirname + '/response.json'); // read the 'response.json' shema - and build the response accordingly
    var responseData = JSON.parse(contents);
    var objectKeys = Object.keys(result[0]);
    var customerShippingAddressObj = {};
    var profilePaymentDetails = {};

    logger.logInfo("Start building response body..");

    for (var key in objectKeys) { // Iteratiing through mongodb result Obj properties

        if (responseData[objectKeys[key]] != undefined)
            responseData[objectKeys[key]] = result[0][objectKeys[key]];

        if (objectKeys[key] == "addressLine1" || objectKeys[key] == "city" || objectKeys[key] == "zipCode" || objectKeys[key] == "state") {

            customerShippingAddressObj[objectKeys[key]] = result[0][objectKeys[key]];
        }
        if (objectKeys[key] == "cardType" || objectKeys[key] == "creditCard" || objectKeys[key] == "lastFourDigits" || objectKeys[key] == "expiryMonth" || objectKeys[key] == "expiryYear" || objectKeys[key] == "zipCode" || objectKeys[key] == "isDefault") {

            profilePaymentDetails[objectKeys[key]] = result[0][objectKeys[key]];
        }
    }

    responseData["customerShippingAddress"] = customerShippingAddressObj;
    responseData["profilePaymentDetails"] = [profilePaymentDetails];
    return responseData;
}

/**
 * Function for Checking - Error code 400  & 401 type
 */
function isRequestParamValidationMeat(req, res) {

    try {

        var patientId = req.query["patientId"];

        if (patientId == undefined)
            throw new Error(error.HttpStatusCodes.INVALIDREQ);

        if (req.headers.authorization == undefined)
            throw new Error(error.HttpStatusCodes.UNAUTHORIZED);

    } catch (err) {

        logger.logDebug("Error 400 ... API input not mathing expected params/request body structure...");
        sendErrorCode(res, err.message);
        return false;
    }

    return true;
}

/**
 * Function for triggering Error response
 */
function sendErrorCode(res, ecode) {

    var responseString = error.getError(ecode);
    res.status(ecode);
    res.set('Content-Type', 'application/json');
    res.send(responseString);

}

module.exports = customerRouter