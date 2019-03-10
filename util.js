module.exports = {
    formatError(message, description, code) {
        return { error: message, description: description || '', code: code || '' };
    },
    isRouteDefinedInDB(reqRoute, dbData) {
        let isRouteExist = dbData.hasOwnProperty(reqRoute);
        return isRouteExist;
    },
    log(message, logObject) {
        return this.myLoggerImpl(`LOG : ${message} `, logObject);
    },
    warn(message, logObject) {
        return this.myLoggerImpl(`WARN : ${message} `, logObject);
    },
    error(message, logObject) {
        return this.myLoggerImpl(`ERROR : ${message} `, logObject);
    },
    myLoggerImpl(message, logObject) {
        if (typeof message !== 'undefined' && typeof logObject !== 'undefined') {
            return console.log(message + new Date().toTimeString(), logObject);
        } else {
            return console.log(message + new Date().toTimeString());
        }
    }
}