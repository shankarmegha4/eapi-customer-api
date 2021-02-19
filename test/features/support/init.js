"use strict";

const apickli = require("apickli");
const { defineSupportCode } = require("cucumber");

defineSupportCode(function ({ Before }) {
    Before(function () {
        this.apickli = new apickli.Apickli("http", "localhost:8080");
        this.apickli.addRequestHeader("Cache-Control", "no-cache");
    });
});