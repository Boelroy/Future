'use strict';
var future = require('./future.js');

exports.pending = function() {
    var pending = {};

    pending.promise = future(function(resolve, reject) {
        pending.fulfill = resolve;
        pending.reject = reject;
    });

    return pending;
};

exports.fulfilled = function(x){
    return future(function(resolve){
        resolve(x);
    });
};
exports.rejected = function(x){
    return future(function(_, reject){
        reject(x);
    });
};
