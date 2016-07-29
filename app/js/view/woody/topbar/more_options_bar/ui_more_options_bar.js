"use strict";

Cotton.UI.MoreOptions.UIMoreOptionsBar = Class.extend({

  /**
   * General Dispatcher that allows two diffent parts of the product to communicate
   * together through the controller of the app.
   */
  _oGlobalDispatcher : null,

  /**
   * {DOM} black layer covering the world UI, containing the settings box.
   * if clicked (i.e. clicked outside of the box, the settings are closed)
   */
  _$settings_bar : null,

  /**
   * @param {Cotton.Messaging.Dispatcher} oGlobalDispatcher
   */
  init : function(oGlobalDispatcher) {
    var self = this;
    this._oGlobalDispatcher = oGlobalDispatcher;

    // If clicked outside the settings box, we close the settings.
    this._$settings_bar = $('<div class="ct-settings_bar"></div>');
    var $settings_bar_container = $('<div class="ct-settings_bar_container"></div>');
    var $show_rate_us_modal = $('<div class="ct-options show_rate_us_modal"><img src="media/images/topbar/stars_rating.svg" alt="Hamburger Menu"></div>');
    var $show_settings_modal = $('<div class="ct-options show_settings_modal"><img src="media/images/topbar/settings.svg" alt="Hamburger Menu"></div>');
    var $show_favorite_stories = $('<div class="ct-options show_favorite_stories"><img src="media/images/topbar/favorites.svg" alt="Hamburger Menu"></div>');

    oGlobalDispatcher.subscribe('toggle_hamburger_menu', this, function() {
        self.toogle();
    });

    // Define button actions:
    $show_rate_us_modal.click(function () {
        oGlobalDispatcher.publish('toggle_ratings');
    });

    // Define button actions:
    $show_settings_modal.click(function () {
        oGlobalDispatcher.publish('toggle_settings');
    });

    // Define button actions:
    $show_favorite_stories.click(function () {
        oGlobalDispatcher.publish('toggle_favorites');
    });

    // We start with the bar hidden.
    this._$settings_bar.append(
        $settings_bar_container.append(
            $show_rate_us_modal, $show_settings_modal, $show_favorite_stories
        )
    );
    this._$settings_bar.hide();
  },

  $ : function() {
    return this._$settings_bar;
  },

  toogle: function () {
    this._$settings_bar.toggle();
  }

});
