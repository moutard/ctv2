"use strict";

/**
 * Class that displays
 * - the title of the shelf follow by an horizontal date in the journal,
 * - a list of cover per stories.
 */
Cotton.UI.Library.Shelf.UIShelf = Class.extend({

  /**
   * {Cotton.UI.Library.Shelf.ShelfTitle}
   *  Element that handle date display, and the line. That's the id
   * of the shelf.
   */
  _oShelfTitle : null,

  /**
   * {Cotton.UI.Library.Shelf.ShelfContent}
   * Contains all the covers.
   */
  _oShelfContent : null,

  /**
   * {DOM} Shelf element.
   */
  _$shelf : null,

  /**
   * Constructor.
   * @param {Cotton.Model.Shelf}
   *          oShelf: model for the UI.
   * @param {Cotton.Model.Dispatcher}
   *          oGlobalDispatcher
   */
  init : function(oShelf, oGlobalDispatcher) {

    this._oShelfTitle = new Cotton.UI.Library.Shelf.ShelfTitle(oShelf.title());
    this._oShelfContent = new Cotton.UI.Library.Shelf.ShelfContent(oShelf.stories(), oGlobalDispatcher);
    this._$shelf = $('<div class="ct-shelf"></div>');

    this._$shelf.append(
      this._oShelfTitle.$(),
      this._oShelfContent.$()
    );

  },

  $ : function() {
    return this._$shelf;
  },

  setHeight : function(iSlotsPerLine) {
    this._oShelfContent.setHeight(iSlotsPerLine);
    this.postionCovers(iSlotsPerLine);
  },

  postionCovers : function(iSlotsPerLine) {
    this._oShelfContent.positionCovers(iSlotsPerLine);
  },

  numberOfStories : function() {
    return this._oShelfContent.length();
  },

  removeCoverFromShelf : function(iStoryId, iSlotsPerLine) {
    this._oShelfContent.removeCoverFromContainer(iStoryId, iSlotsPerLine)
  },

  /**
   * addStories
   * Dynamically add stories to the shelf.
   * @param {Array<Cotton.Model.Story>} lStories
   */
  addStories : function(lStories, iSlotsPerLine) {
    this._oShelfContent.add(lStories, iSlotsPerLine);
  },

  setComplete : function() {
    this._bIsComplete = true;
  },

  isComplete : function() {
    return this._bIsComplete;
  },

  hide : function() {
    // hide both the timestamp and the container by reducing their height to 0
    // they are animated, giving a collapsing effect.
    this._oShelfContent.$().addClass('ct-collapsed');
    this._oShelfTitle.$().addClass('ct-collapsed');
  },

  purge : function() {
    this._bIsComplete = null;
    this._oShelfTitle.purge();
    this._oShelfTitle = null;
    this._oShelfContent.purge();
    this._oShelfContent = null;
    this._$shelf.remove();
  }

});
