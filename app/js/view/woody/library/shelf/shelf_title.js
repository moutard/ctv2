"use strict";

/**
 * Class that display the title of the shelf.
 * It can be a title of a search or a data follow by an horizontal date in the journal.
 */
Cotton.UI.Library.Shelf.ShelfTitle = Class.extend({

  /**
   * {DOM} Current element,
   * contains the horizontal line with a date to separate 2 periods of times.
   */
  _$shelf_title : null,

  /**
   * @param {String}
   *          sTitle: title of the shelf.
   */
  init : function(sTitle) {
    this._$shelf_title = $('<div class="ct-shelf_title"></div>');
    this._$title = $('<div class="ct-h1">' + sTitle + '</div><div class="ct-line"></div>');

    // Construct element.
    this._$shelf_title.append(this._$title);
  },

  $ : function() {
    return this._$shelf_title;
  },

  purge : function() {
    this._$shelf_title.remove();
    this._$shelf_title = null;
  }

});
