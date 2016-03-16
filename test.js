'use strict';
var future = require('./future.js');

exports.deferred = function() {
    var pending = {};

    pending.promise = future(function(resolve, reject) {
        pending.resolve = resolve;
        pending.reject = reject;
    });

    return pending;
};

exports.resolved = function(x){
    return future(function(resolve){
        resolve(x);
    });
};
exports.rejected = function(x){
    return future(function(_, reject){
        reject(x);
    });
};
