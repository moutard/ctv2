"use strict";
var Cotton = require('cotton');

Cotton.Core.Notification = Class.extend({

  init : function(sPreviousVersion) {
    if (sPreviousVersion < "0.8.0") {
      var self = this;
      this._sId = "1";
      this._sTitle = "Try out the future of cottonTracks!";
      this._sMessage = "We are testing an advanced version for cottonTracks, with more control over your organisation\n"
        + "Click here to check it out!";

      chrome.notifications.create(self._sId, {
        "type":"image",
        "iconUrl": "/media/images/browser_action/cbutton38.png",
        "imageUrl": "/media/images/notifications/notif_screen.png",
        "title": this._sTitle,
        "message": this._sMessage
      }, function(){});

      chrome.notifications.onClicked.addListener(function(sNotificationId){
        if (sNotificationId === self._sId){
          chrome.browserAction.onClicked.dispatch();
        }
      });
    }
  }
});
