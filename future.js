'use strict';
(function(root, factory){
    if (typeof define === 'function' && define.amd) {
        define('future', function(){
            return factory();
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory();
    } else {
        root.future = factory();
    }
})(this, function(){

var future,
  Future = function() {
  this.status = 'pending';
};

function process(_future, val, status) {
  _future.status = status;
  _future.x = val;
  var _queue, next,
    onHandleType = status === 'fullfiled' ? 'onFullFilled' : 'onRejected',
    isReject = status === 'rejected';

  setTimeout(function(){
    _queue = _future.queue.slice();
    _future.queue = [];
    while(_queue.length) {
      next = _queue.shift();
      if (typeof next[onHandleType] !== 'function')  {
        makeThenable(val, _future, next.future, isReject);
        return;
      }
      var handler = next[onHandleType];
      try {
        makeThenable(handler(val), _future, next.future, isReject && next.type === 1);
      } catch(e) {
        reject(next.future)(e);
      }
    }
  }, 0);
}

function resolve(_future) {
  return function(data) {
    process(_future, data, 'fullfiled');
  };
}

function reject(_future) {
  return function(reason) {
    process(_future, reason, 'rejected');
  };
}

var then = function(_future){
  return function(onFullFilled, onRejected) {
    var next = future(function() {

    });
    _future.queue.push({
      onFullFilled: onFullFilled,
      onRejected: onRejected,
      future: next
    });
    if (_future.status === 'fullfiled' && onFullFilled) {
      resolve(_future)(_future.x);
    } else if (_future.status === 'rejected' && onRejected){
      reject(_future)(_future.x);
    }
    return next;
  };
};

function handle(isReject, promise, x) {
  if (isReject) {
    reject(promise)(x);
  } else {
    resolve(promise)(x);
  }
}

function makeThenable(x, _future, promise, isReject) {
  if (x instanceof Future) {
    if (promise === x) {
      throw new TypeError('Should not return the same promise');
    }
    x.queue.push({
      onFullFilled: function(value){
        return value;
      },
      onRejected: function(reason) {
        return reason;
      },
      future: promise,
      type: 1
    });
    if (x.status === 'pending') return;
    if (x.status === 'rejected') {
      reject(promise)(x.x);
      return;
    }
    promise = x;
    x = promise.x;
  } else if ((x && typeof x === 'object') || (x && typeof x === 'function')){
    var _then;
    try {
      _then = x.then;
      x.status = 'pending';
      if(typeof _then === 'function') {
        var resolvePromise = function(value){
          if (x.status === 'pending'){
            x.status = 'fullfiled';
            makeThenable(value, _future, promise);
          }
        };
        var rejectPromise = function(value) {
            if (x.status === 'pending'){
              x.status = 'rejected';
              reject(promise)(value);
            }
        };
        try{
          _then.call(x, resolvePromise, rejectPromise);
        } catch(e) {
          if (x.status === 'pending')
            reject(promise)(e);
        }
      } else {
        handle(isReject, promise, x);
      }
     } catch(e) {
        reject(promise)(e);
    }
    return;
  }
  handle(isReject, promise, x);
}

future = function(resolver) {
  var _future = new Future();

  _future.queue = [];
  _future.then = then(_future);

  try {
    resolver(resolve(_future), reject(_future), _future);
  } catch(e) {

  }
  return _future;
};

return future;
});
