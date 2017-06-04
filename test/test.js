var rval = require('./../build/rval.node.js');
var assert = require('assert');

describe('rval', function() {
  describe('Reactive value', function() {
    it('should be able to create a value via rval(value) and contain it in `is` property', function() {
      var val = Math.random();
      var x = rval(val);
      assert(x.is === val);
    });
    it('should be able to change the value via changing `is` property', function() {
      var val = Math.random();
      var x = rval(val);
      var val2 = Math.random();
      x.is = val2;
      assert(x.is === val2);
    });
  });
  describe('Reactive functions', function() {
    it('should be able to create a function based on dependencies via rval(func, depArray)', function() {
      var fun = function(a, b) { return a+b; };
      var a = rval( Math.random() );
      var b = rval( Math.random() );
      var c = rval( fun, [a, b] );
      assert(c.is === fun(a.is, b.is));
    });
    it('value is modified when dependencies are modified', function() {
      var fun = function(a, b) { return a+b; };
      var a = rval( Math.random() );
      var b = rval( Math.random() );
      var c = rval( fun, [a, b] );
      assert(c.is === fun(a.is, b.is));
      a.is = Math.random();
      assert(c.is === fun(a.is, b.is));
      b.is = Math.random();
      assert(c.is === fun(a.is, b.is));
    });
    it('should support multiple layers of dependencies and modify values when deps changed', function() {
      var f_val = Math.random();
      var g_val = Math.random();
      
      var e_fun = function(f) { return f * 2; };
      var d_fun = function(e, g) { return e + g; };
      var h_fun = function(d) { return d * 3; };
      var c_fun = function(g, h) { return 2 * (g + h); };
      var b_fun = function(f) { return f + 1; };
      var a_fun = function(b, c) { return b * c; };

      var f = rval(f_val);
      var g = rval(g_val);
      var e = rval(e_fun, [f]);
      var d = rval(d_fun, [e, g]);
      var h = rval(h_fun, [d]);
      var c = rval(c_fun, [g, h]);
      var b = rval(b_fun, [f]);
      var a = rval(a_fun, [b, c]);

      assert(f.is === f_val);
      assert(g.is === g_val);
      assert(e.is === e_fun(f.is));
      assert(d.is === d_fun(e.is, g.is));
      assert(h.is === h_fun(d.is));
      assert(c.is === c_fun(g.is, h.is));
      assert(b.is === b_fun(f.is));
      assert(a.is === a_fun(b.is, c.is));

      f.is = Math.random();

      assert(e.is === e_fun(f.is));
      assert(d.is === d_fun(e.is, g.is));
      assert(h.is === h_fun(d.is));
      assert(c.is === c_fun(g.is, h.is));
      assert(b.is === b_fun(f.is));
      assert(a.is === a_fun(b.is, c.is));

      g.is = Math.random();

      assert(e.is === e_fun(f.is));
      assert(d.is === d_fun(e.is, g.is));
      assert(h.is === h_fun(d.is));
      assert(c.is === c_fun(g.is, h.is));
      assert(b.is === b_fun(f.is));
      assert(a.is === a_fun(b.is, c.is));
    });
  });
  describe('Disconnecting via rval.discon(rfun)', function() {
    it('should be able to disconnect reactive function from its dependencies', function() {
      var fun = function(a, b) { return a+b; };
      var a = rval( Math.random() );
      var b = rval( Math.random() );
      var c = rval( fun, [a, b] );
      var value1 = c.is;
      rval.discon(c);
      a.is = a.is + 10;
      assert(c.is === value1);
    });
    it('disconnecting should keep relationship between the reactive function and its update list', function() {
      var fun = function(a, b) { return a+b; };
      var a = rval( Math.random() );
      var b = rval( Math.random() );
      var c = rval( fun, [a, b] );
      var d = rval( fun, [a, c] );
      var value1 = c.is;
      rval.discon(c);
      a.is = a.is + 10;
      assert(d.is === fun(a.is, value1));
      c.is = Math.random();
      assert(d.is === fun(a.is, c.is));
    });
  });
});