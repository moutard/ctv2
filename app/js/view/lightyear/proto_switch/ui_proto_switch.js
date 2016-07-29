"use strict";

/**
 * Screen that we display to our after clicking on the protoswitch button.
 * - display a friendly message to explain why we are migrating.
 * - ask people to confirm
 * - tell them they can always go back.
 */
Cotton.UI.ProtoSwitch.UIProtoSwitch = Class.extend({

  /**
   * {DOM} element that contains a the button to switch that we put in the topbar.
   */
  _$proto_switch : null,


  /**
   * {DOM} element that contains a modal used to display a friendly message before the switch.
   */
   _$box : null,

  /**
   * Constructor
   */
  init : function(oGlobalDispatcher) {

    // Button to switch.
    this._$proto_switch = $('<div class="ct-proto_switch"></div>').click(function(e){
      if (e.target === this) {
        oGlobalDispatcher.publish('toggle_switch');
        // Analytics tracking
        Cotton.ANALYTICS.escapeSwitch();
      }
    });

    // Actual proto_switch box.
    this._$box = $('<div class="ct-proto_switch_box"></div>');

    this._$title = $('<div class="ct-switch_box_title">Our new version is in the box</div>');
    this._$subtitle = $('<div class="ct-switch_box_subtitle"></div>');
        var $p2 = $('<p>This new version offers a new design, and will include more functionalities like customisation, sharing, statistics.</p>');
        var $p3 = $('<p>We always took your privacy seriously, so nothing changes about that in this new version. By default everything is stored locally on your computer.</p>');
        var $privacy = $('<a class="ct-switch_box_privacy" href="http://www.cottontracks.com/privacy.html" target="_blank">Read our privacy policy here</a>');
        var $p4 = $('<p>Your opinion matters, feel free to <a href="mailto:contact@cottontracks.com?Subject=Feedbacks" target="_top">tell us what you think.</a> If you do not like this new version you can always go back to the previous one using the settings.</p>');

    // Accept new version form.
    this._oForm = new Cotton.UI.ProtoSwitch.Form(oGlobalDispatcher);

    // Cross for closing the settings page.
    this._$close = $('<div class="ct-close_proto_switch_box"></div>').click(function(){
      oGlobalDispatcher.publish('toggle_switch');
      // Analytics tracking
      Cotton.ANALYTICS.escapeSwitch();
    });

    this._$proto_switch.append(
      this._$box.append(
        this._$title,
        this._$subtitle.append(
            $p2, $p3.append($privacy), $p4
        ),
        this._oForm.$(),
        this._$close
      )
    );
  },

  $ : function() {
    return this._$proto_switch;
  },

  purge : function() {
    this._$subtitle.remove();
    this._$subtitle = null;
    this._$title.remove();
    this._$title = null;
    this._oForm.purge();
    this._oForm = null;
    this._$box.remove();
    this._$box = null;
    this._$proto_switch.remove();
    this._$proto_switch = null;
  }
});
