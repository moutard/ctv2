"use strict";
var Cotton = require('cotton');
var Core = require ('core/chrome/notification');

/**
 * Display a notification to warn the user that there is a new version.
 */
Cotton.Controllers.NewVersion = Class.extend({

  _oBrowserNotificationSystem : null,

  /**
   * args {string} sPreviousVersion: version of cottonTracks before the update.
   */
  init : function(sPreviousVersion) {
    this._oBrowserNotificationSystem = new Core.Notification();

    // FIXME: use grunt build to inject the version id.
    if (sPreviousVersion < "0.8.0") {
      var self = this;
      this._sId = "1";
      // FIXME: use translate.
      this._sMessage = "We are testing an advanced version for cottonTracks, with more control over your organisation\n"
        + "Click here to check it out!";

      this._oBrowserNotificationSystem.create(self._sId, {
        "type":"image",
        "iconUrl": "/media/images/browser_action/cbutton38.png",
        "imageUrl": "/media/images/notifications/notif_screen.png",
        "title": "Try out the future of cottonTracks!",
        "message": this._sMessage
      }, function(){});

      this._oBrowserNotificationSystem.onClicked.addListener(function(sNotificationId) {
        if (sNotificationId === self._sId) {
          chrome.browserAction.onClicked.dispatch();
        }
      });
    }
  }
});
