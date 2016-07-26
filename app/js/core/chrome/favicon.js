'use strict';

var Cotton = require('cotton');

Cotton.Core.Favicon = Class.extend({
  init : function() {

  },

  getSrc : function() {
    return "chrome://favicon/";
  }

});
