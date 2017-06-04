/**
 * @license MIT
 * @copyright Kirill Shestakov 2017
 * @see https://github.com/guitarino/rval/
 */
/**
 * IIFE that returns a function for creating reactive object (reactive function / reactive value)
 * 
 * Use rval(value) to create reactive value, rval(func, depsArray) to create reactive functions
 * Use rval.discon(robject) to disconnect reactive object from its dependencies
 */
var rval = function(g) {
  'use strict';

  // property that will be added to the reactive object to view / modify current value
  var PROPERTY = 'is';

  var priv_key = {};
  var priv_prop = 'Symbol' in g ? g.Symbol() : '_valPrivate' + Math.random();

  /**
   * Quick polyfill for Array.isArray
   */
  var isArray = Array.isArray || function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };

  /**
   * Adds an empty private storage to the reactive object
   * @param {object} o - reactive object
   */
  var privacy = function(o) {
    if (!(priv_prop in o)) {
      var priv_store = {};
      Object.defineProperty(o, priv_prop, {
        value: function(provided_key) {
          if (priv_key === provided_key) return priv_store;
          console.error('Cannot access private props');
          return undefined;
        }
      });
    }
    return o[priv_prop](priv_key);
  };

  /**
   * Adds reactive object to update lists
   * @param {object} o - reactive object to add to update lists
   * @param {object[]} updaters - updaters (initially, o's dependencies)
   */
  var addMeToUpdateLists = function(o, updaters) {
    for (var i=0; i<updaters.length; i++) {
      var updater = updaters[i];
      var updater_priv = privacy(updater);
      if (!~updater_priv.updateList.indexOf(o)) {
        updater_priv.updateList.push(o);
        // All descendents of updaters are also updaters
        addMeToUpdateLists(o, updater_priv.dependencies);
      }
    }
  };

  /**
   * Removes reactive object from update lists
   * @param {object} o - reactive object to remove from update lists
   * @param {object[]} updaters - updaters (initially, o's dependencies)
   */
  var removeMeFromUpdateLists = function(o, updaters) {
    for (var i=0; i<updaters.length; i++) {
      var updater = updaters[i];
      var updater_priv = privacy(updater);
      var index = updater_priv.updateList.indexOf(o);
      if (~index) {
        updater_priv.updateList.splice(index, 1);
        // Dependencies of updaters are also updaters
        removeMeFromUpdateLists(o, updater_priv.dependencies);
      }
    }
  };

  /**
   * Checks if the value of reactive function needs update (i.e. if
   * its dependencies changed)
   * @param {object} o - reactive object
   */
  var isRecalculationNeeded = function(o) {
    var dependencies = privacy(o).dependencies;
    for (var i=0; i<dependencies.length; i++) {
      var dep = dependencies[i];
      var dep_priv = privacy(dep);
      if ('old' in dep_priv) {
        return true;
      }
    }
    return false;
  };

  /**
   * Calculates the value of a reactive function depending of the
   * values of its dependencies and their old values
   * @param {object} o - reactive function
   */
  var calculate = function(o) {
    var args = [];
    var args_old = [];

    var priv = privacy(o);

    var dependencies = priv.dependencies;
    for (var i=0; i<dependencies.length; i++) {
      var dep = dependencies[i];

      var dep_priv = privacy(dep);
      args.push(dep_priv.val);
      args_old.push('old' in dep_priv ? dep_priv.old : dep_priv.val);
    }

    // Appending old arguments to new arguments
    [].push.apply(args, args_old);

    return priv.fun.apply(null, args);
  };

  /**
   * A getter to look up the value of a reactive object
   * @param {object} o - reactive object
   */
  var get = function(o) {
    var priv = privacy(o);
    return priv.val;
  };

  /**
   * A setter that changes the reactive object and triggers update
   * of its update list reactive objects
   * @param {object} o - reactive object
   * @param {*} val - value to set the reactive object to
   */
  var set = function(o, val) {
    var priv = privacy(o);

    if (priv.val === val) return;

    priv.old = priv.val;
    priv.val = val;

    var updateList = priv.updateList;

    // First, update all vals from update list
    for (var i=0; i<updateList.length; i++) {
      var updated = updateList[i];
      var updated_priv = privacy(updated);

      if (isRecalculationNeeded(updated)) {
        var new_val = calculate(updated);
        if(new_val !== updated_priv.val) {
          updated_priv.old = updated_priv.val;
          updated_priv.val = new_val;
        }
      }
    }

    // Second, clean all old values
    delete priv.old;
    for (var i=0; i<updateList.length; i++) {
      var updated = updateList[i];
      var updated_priv = privacy(updated);

      delete updated_priv.old;
    }
  };

  /**
   * Defines setter and getter for changing / looking up current value
   * @param {object} o - reactive object
   */
  var defineIs = function(o) {
    Object.defineProperty(o, PROPERTY, {
      enumerable: true,
      set: function(val) {
        set(o, val);
      },
      get: function() {
        return get(o);
      }
    });
  };

  /**
   * Either creates a reactive object (reactive function or reactive function).
   * @param {*} val - either a function (for reactive function) or any other value (reactive function) 
   * @param {object[]} [deps] - in case it's a reactive function, provide dependencies
   */
  var rval = function(val, deps) {
    var o = {};

    var priv = privacy(o);
    priv.updateList = [];

    defineIs(o);
    
    if (isArray(deps) && typeof val === 'function') {
      priv.fun = val;
      priv.dependencies = deps;
      addMeToUpdateLists(o, priv.dependencies);
      priv.val = calculate(o);
    }

    else {
      priv.dependencies = [];
      priv.val = val;
    }

    return o;
  };

  /**
   * Disconnects the reactive object from its dependencies.
   * Will fail if some reactive function depends on it.
   * @param {object} o - reactive object to disconnect
   */
  rval.discon = function(o) {
    var priv = privacy(o);
    removeMeFromUpdateLists(o, priv.dependencies);
    priv.dependencies = [];
    delete priv.fun;
  };

  return rval;
}((this && this.window) || global);
module.exports = rval;