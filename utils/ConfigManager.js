/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-extra-semi */

var path = require('path');
var fs = require('fs');
var async = require('async');
var yaml = require('js-yaml');
var _ = require('underscore');
const util = require('./utils');

const envServer = process.env.ENV_SERVER;
const envConfigFilePath = process.env.ENV_CONFIG_FILE_PATH;

var configObj = null;
var matchRegex = /(\{.*?\})/g;
try {
	async.parallel({
		moduleConfig: function (callback) {
			let appConfigFile = '../config/default.json';
			let envConfigFile = '';
			if (envServer) {
				envConfigFile = '../config/env/' + envServer + '/config.yaml';
			} else {
				envConfigFile = envConfigFilePath + '/config.yaml';
			}

			if (envServer == null && envConfigFilePath == null) {
				throw Error('Either ENV_SERVER or ENV_CONFIG_FILE_PATH parameter must be set');
			}
			getConfigObj(appConfigFile, envConfigFile, function (config) {
				callback(null, config);
			});
		}
	}, function (err, results) {
		if (!err) {
			configObj = Object.assign({}, results.moduleConfig);
		} else {
			let appConfig = fs.readFileSync(path.join(__dirname, appConfigFile), 'utf8');
			appConfig = JSON.parse(appConfig);
			configObj = Object.assign({}, appConfig);
		}

	});

} catch (error) {
	console.log('Config Manager error : ', error);
	util.exitApp();
}


function getConfigObj(appConfigFile, envConfigFile, callback) {
	let appConfigFilePath = path.join(__dirname, appConfigFile);
	if (fs.existsSync(appConfigFilePath)) {
		let appConfig = fs.readFileSync(appConfigFilePath, 'utf8');
		appConfig = JSON.parse(appConfig);
		appConfig = JSON.stringify(appConfig);
		let parameterizedProps = _.uniq(appConfig.toString().match(matchRegex));
		if (envServer) {
			envConfigFile = path.join(__dirname, envConfigFile);
		}
		let envConfig = null;
		if (fs.existsSync(envConfigFile)) {
			let yamlContent = fs.readFileSync(envConfigFile, 'utf8');
			if (envServer) {
				yamlContent = yaml.load(yamlContent).data['config.yaml'];
			}
			envConfig = yaml.load(yamlContent);
			getENVConfig(envConfig, function (updatedEnvConfig) {
				async.each(parameterizedProps, function (value, callbackFunction) {
					var envProp = value.substring(2, value.length - 1);
					let envConfigValue = updatedEnvConfig[envProp];
					if (envConfigValue === undefined) {
						envConfigValue = process.env[envProp];
					}
					if (envConfigValue || envConfigValue !== undefined) {
						if (typeof (envConfigValue) === 'boolean' || typeof (envConfigValue) === 'number') {
							value = '"' + value + '"';
						}
						var replaceRegex = new RegExp(value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), 'g');
						appConfig = appConfig.replace(replaceRegex, envConfigValue);
					}
					callbackFunction();
				}, function (err) {
					callback((envConfig));
				});
			});
		}
	}
}


function getENVConfig(envConfig, callback) {
	let stringifiedEnvConfig = JSON.stringify(envConfig);
	let yamlParameterizedProps = _.uniq(stringifiedEnvConfig.match(matchRegex));
	if (_.isEmpty(yamlParameterizedProps)) {
		return callback(envConfig);
	}
	async.each(yamlParameterizedProps, function (value, callbackFunction) {
		var envProp = value.substring(2, value.length - 1);
		let envConfigValue = process.env[envProp];
		if (envConfigValue || envConfigValue !== undefined) {
			if (typeof (envConfigValue) === 'boolean' || typeof (envConfigValue) === 'number') {
				value = '"' + value + '"';
			}
			var replaceRegex = new RegExp(value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), 'g');
			stringifiedEnvConfig = stringifiedEnvConfig.replace(replaceRegex, envConfigValue);
		}
		callbackFunction();
	}, function (err) {
		callback(yaml.load(stringifiedEnvConfig));
	});
}

module.exports = configObj;
