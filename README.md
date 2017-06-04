# rval

Intuitive way of doing reactive programming

## Install
The utility is tiny (0.8K min+gz, 1.7K min)

### Browser
Add to your HTML page

```html
<script src="path/to/build/rval.js"></script>
```

### NPM
Add as a dependency to your project

```
npm install --save https://github.com/guitarino/rval
```

## The idea
In incremental or reactive programming, when a piece of data changes, only the outputs that depend on that piece of data will be recomputed and updated.

Standard libraries for reactive programming are powerful, but are more conceptually involved.

The idea behind `rval` is simple: we create some reactive reactive objects (reactive functions and reactive objects) that depend on *other* reactive objects.

For example,

```javascript
function profit (revenue, cost) {
  return revenue - cost;
}

function logProfit (profit) {
  console.log("Profit is", profit);
}

var logic = {};
logic.revenue = rval(150); // Creates a reactive variable `revenue` with a value 150
logic.cost    = rval(100); // Creates a reactive variable `cost` with a value 100

// Creates a reactive function that depdends on `revenue` and `cost` and
// will get recalculated every time `revenue` or `cost` changes
logic.profit  = rval(profit, [logic.revenue, logic.cost]);

// We can create "hidden" reactive functions that are not accessible for the
// user, but will still update whenever their dependencies change,
// for example, for DOM updates.
rval(logProfit, [logic.profit]);
```

`logic.profit` will automatically get calculated using the `profit` function as `logic.revenue` minus `logic.cost`.

```javascript
// Console: Profit is 50
```

Then, if you update a piece of data, say `logic.revenue`, like so:

```javascript
logic.revenue.is = 200;
```

Then the reactive functions that depend on it, which in this case is `logic.profit`, will get automatically recalculated. And, you will see the new value for profit being logged in the console, because the function `logProfit` will get called whenever `logic.profit` changes:

```javascript
// Console: Profit is 100
console.log('This should be true', logic.profit.is === 100);
```

This approach is similar to a spreadsheet-like functionality and can be especially useful for
* Specifying behaviour more declaratively
* Implementing reactive DOM and templating systems
* Working with changing app or component state
* Creating customization system for [Custom Elements](https://developers.google.com/web/fundamentals/getting-started/primers/customelements)

## How to
All you need to know to work with the library is this:

* Use `rval(someValue)` to define a reactive value with initial value `someValue`.
* Use `rval(someFunc, depArray)` to define a reactive function whose calculation will be done based on the function `someFunc` and the array of dependencies `depArray`.
* Get the current value of a reactive object `robj` by calling `robj.is`.
* Use `robj.is = someValue` to set the value of the reactive object `robj` to `someValue`. This will trigger an update of all reactive functions that depend on `robj`.
* In order to disconnect reactive function `rfun` from its dependencies, call `rval.discon(rfun)`. It will basically turn any reactive function into a reactive value, in that, its dependencies will no longer update it. It will still keep its current value, and the values that depend on it will continue to depend on it. You might want to use it to avoid memory leaks, in case you need to delete some reactive objects.
* You can build up dependency trees where reactive objects depending on other reactive objects. Only the values that changed will trigger an update of further reactive functions. The update will happen in the correct dependency resolution order.
* In order to find out if the value is changed, a strict equality is used `===`. It's important to know in case your reactive value is an object or an array. If you want the value to be changed, you might have to create new array / new object every time instead of modifying the existing one.

## License
[MIT License](https://github.com/guitarino/rval/blob/master/LICENSE)