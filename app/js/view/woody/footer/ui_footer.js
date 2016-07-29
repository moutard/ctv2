"use strict";

/**
 * Footer class.
 * rq: this is one of the only UI class that get it's element directly from the html, and do no dynamically append it.
 * That's to make the footer always at the bottom.
 */
Cotton.UI.Footer = Class.extend({
  /**
   * {DOM} current element that grab the footer.
   */
  _$footer : null,

  init: function (oGlobalDispatcher) {
    this._$footer = $("footer");

    var $rate_us = this._$footer.find('.ct-rate_us');
    $rate_us.click(function() {
        oGlobalDispatcher.publish('toggle_ratings');
    });

  },

  $: function () {
    return this._$footer;
  }
});
