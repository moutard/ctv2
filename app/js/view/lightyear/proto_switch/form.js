"use strict";

/**
 * Just a simple yes / no question to validate that the customers wants to migrate to the new version.
 */
Cotton.UI.ProtoSwitch.Form = Class.extend({

  init : function(oGlobalDispatcher) {
    var self = this;

    this._$form = $('<form class="ct-form"></form>');
    this._$submit = $('<input class="ct-form_submit" type="submit" name="submit" value="Show me the new version." id="ct-form_submit">').click(function () {
      oGlobalDispatcher.publish('switch_to_proto');
      Cotton.ANALYTICS.validateSwitch();
    });

    // Exit protoswitch by clicking no_thanks.
    this._$dismiss = $('<div class="ct-dismiss">No Thanks, I will keep this version for now</div>').click(function(){
      oGlobalDispatcher.publish('toggle_switch');
      // Analytics tracking
      Cotton.ANALYTICS.dismissSwitch('no_thanks');
    });

    this._$form.append(
      this._$submit,
      this._$dismiss
    );
  },

  $ : function() {
    return this._$form;
  },

  purge : function() {
    this._$dismiss.remove();
    this._$dismiss = null;
    this._$submit.remove();
    this._$submit = null;
    this._$form.remove();
    this._$form = null;
  }
});
