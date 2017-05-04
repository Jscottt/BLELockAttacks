var cordova = require('cordova');

var Security = {
    aesEncrypt : function(text, key, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback,
                     'Security', // mapped to our native Java class called "CryptographyAes"
                     'aesEncrypt', // with this action name
                     [text, key]);
    },
    aesDecrypt : function(text, key, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback,
                     'Security', // mapped to our native Java class called "CryptographyAes"
                     'aesDecrypt', // with this action name
                     [text, key]);
    },
    encrypt : function(text, key, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback,
                     'Security', // mapped to our native Java class called "CryptographyAes"
                     'encrypt', // with this action name
                     [text, key]);
    },
    decrypt : function(text, key, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback,
                     'Security', // mapped to our native Java class called "CryptographyAes"
                     'decrypt', // with this action name
                     [text, key]);
    }
};

module.exports = Security;
