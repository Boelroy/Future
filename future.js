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

function resolve(_future) {
  return function(data) {
    var _queue, next;
    _future.status = 'fullfiled';
    _future.x = data;
    setTimeout(function() {
      _queue = _future.queue.slice();
      _future.queue = [];
      while(_queue.length) {
        next = _queue.shift();
        if (typeof next.onFullFilled !== 'function') makeThenable(data, _future, next.future);
        var onFullFilled = next.onFullFilled;
        try {
          makeThenable(onFullFilled(data), _future, next.future);
        } catch (e) {
          reject(next.future)(e);
        }
      }
    }, 0);
  };
}

function reject(_future) {
  return function(reason) {
    _future.status = 'rejected';
    _future.x = reason;
    var _queue, next;
    setTimeout(function() {
      _queue = _future.queue.slice();
      _future.queue = [];
      while(_queue.length) {
        next = _queue.shift();
        if (typeof next.onRejected !== 'function') makeThenable(reason, _future, next.future, true);
        var onRejected = next.onRejected;
        try {
          makeThenable(onRejected(reason), _future, next.future, next.type === 1);
        } catch(e) {
          reject(next.future)(e);
        }
      }
    }, 0);
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

function makeThenable(x, _future, promise, isReject) {
  if (x instanceof Future) {
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
  } else if (x && typeof x === 'object' && typeof x.then === 'function'){
    var _then = x.then.bind(x);
    _then.call(x, resolve(promise), reject(promise));
    return;
  }
  if (isReject) {
    reject(promise)(x);
  } else {
    resolve(promise)(x);
  }
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
