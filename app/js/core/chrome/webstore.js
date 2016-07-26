'use strict';
var Cotton = require('cotton');

Cotton.Core.Webstore = Class.extend({
  init : function() {

  },

  getUrl : function() {
    return "https://chrome.google.com/webstore/detail/cottontracks/flmfagndkngjknjjcoejaihmibcfcjdh/reviews";
  },

  getName : function() {
    return "the Chrome Web Store"
  }
});
