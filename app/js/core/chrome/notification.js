"use strict";
var Cotton = require('cotton');
Cotton.Core = Cotton.Core || {};

/**
 * Interface for the notification api.
 * Depending on the browser we may call a different service. As we use chrome as
 * the default we just duplicate the chrome Interface. And when we will
 * use another.
 */
Cotton.Core.Notification = Class.extend({

  init : function() {

  },

  create : function(iId, dArgs) {
    return chrome.notifications.create(iId, dArgs);
  },

  onClicked : function() {
    // Rq: if we need to map the interface for opera or firefox we can do it here.
    return chrome.notifications.onClicked;
  }
});

module.exports = Cotton.Core;
