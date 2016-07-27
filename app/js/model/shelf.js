'use strict';

/**
 * Shelf
 */
Cotton.Model.Shelf = Class.extend({

  /**
   * title of the shelf.
   */
  _sTitle : null,

  /**
   * Array<Cotton.Model.Stories> list of stories that belongs to this shelf.
   */
  _lStories : null,

  /**
   *
   */
  init : function() {
    this._sTitle = "";
    this._lStories = [];
  },

  title: function () {
    return this._sTitle;
  },

  setTitle: function(sTitle) {
    this._sTitle = sTitle;
  },

  stories: function() {
    return this._lStories;
  },

  setStories: function(lStories) {
    this._lStories = lStories;
  }
});
