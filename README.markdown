<a href="http://promises-aplus.github.com/promises-spec">
    <img src="https://promisesaplus.com/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

[![npm](https://img.shields.io/npm/dy/future.js.svg)]()

## Future.js
#### Concept
the purpose of the this project is to implement the original concept of [Futures and Promises](https://en.wikipedia.org/wiki/Futures_and_promises). Promises in "Promises/A+" is actually one form of Futures, meanwhile, Promises can be used to manipulate Futures.

#### Current status
the first version of the project only implement [Promises/A+](https://promisesaplus.com/), I will add more features and integrate the project gradually.

#### How to use

```javascript

future(function(resolve, reject){

}).then(someDoneFunction, someFailFunction)

```
#### Install with npm

```
npm install node-future

```
