'use strict';
/**
 * class CoversContainer
 * Store all the covers.
 */
Cotton.UI.Library.Shelf.ShelfContent = Class.extend({

  /**
   * {Array<Cotton.UI.Stand.Common.Cover.UICover>} _lCovers:
   */
  _lCovers : null,

  /**
   * {Cotton.Messaging.Dispatcher}
   */
  _oGlobalDispatcher : null,

  /**
   * @param {Array.<Cotton.Model.Story>} lStories
   * @param {Cotton.Messaging.Dispatcher} oGlobalDispatcher
   */
  init : function(lStories, oGlobalDispatcher) {
    this._oGlobalDispatcher = oGlobalDispatcher;
    this._lCovers = [];
    this._$container = $('<div class="ct-covers_container"></div>');
    this.add(lStories);
  },

  $ : function() {
    return this._$container;
  },

  /**
   * Return the number of stories stored in the coversContainer.
   */
  length : function() {
    return this._lCovers.length;
  },

  first : function() {
    return this._lCovers[0];
  },

  last : function() {
    return this._lCovers[this._lCovers.length - 1];
  },

  /**
   * For each stories create a associated cover, append it
   * to the _$container
   *
   * @param {Array.<Cotton.Model.Story>}
   *        lStories: list of stories you want to add.
   */
  add : function(lStories) {
    var lDOMCovers = [];
    for (var i = 0, iLength = lStories.length; i < iLength; i++) {
      var oStory = lStories[i];
      var oSticker = new Cotton.UI.Stand.Common.Sticker(lStories[i], 'library', this._oGlobalDispatcher);
      this._lCovers.push(oSticker);
      lDOMCovers.push(oSticker.$());
    }
    this._$container.append(lDOMCovers);
  },

  setHeight : function(iSlotsPerLine) {
    var COVER_HEIGHT = 250;
    var COVER_TOP_MARGIN = 22;
    var iLines = Math.ceil(this._lCovers.length / iSlotsPerLine);
    this._$container.css('height', iLines * (COVER_HEIGHT + COVER_TOP_MARGIN));
  },

  animate : function() {
    this._$container.addClass('ct-animate');
  },

  positionCovers : function(iSlotsPerLine) {
    var iLength = this._lCovers.length;
    for (var i = 0; i < iLength; i++) {
      this.positionOneCover(this._lCovers[i], i, iSlotsPerLine);
    }
  },

  /**
   * positions a cover on the manager depending on its position in the covers_container
   * and the number of slots per row available
   * @param {int} iSlotsPerRow:
   *    the number of covers you can put on a line
   **/
  positionOneCover : function(oCover, iPosition, iSlotsPerLine) {
    var iPositionOnRow = iPosition % iSlotsPerLine;
    var COVER_HEIGHT = 250;
    var COVER_WIDTH = 396;
    var TOP_MARGIN = 22;
    var LEFT_MARGIN = 25;

    var iTop = (Math.floor(iPosition / iSlotsPerLine)) * (COVER_HEIGHT + TOP_MARGIN);
    var iLeft = (iPositionOnRow) * (COVER_WIDTH + LEFT_MARGIN);
    oCover.setPosition(iTop, iLeft);
  },

  removeCoverFromContainer : function(iStoryId, iSlotsPerLine) {
    var iLength = this._lCovers.length;
    // Array of remaining covers
    var lRemainingCovers = [];
    for (var i = 0; i < iLength; i++) {
      if (this._lCovers[i].id() === iStoryId) {
        // the cover of the story to delete
        this._lCovers[i].purge();
        this._lCovers[i] = null;
        var bDeleted = true;
      } else {
        if (bDeleted) {
          // Covers after the deleted one need to be repositioned.
          this.positionOneCover(this._lCovers[i], i-1, iSlotsPerLine);
        }
        lRemainingCovers.push(this._lCovers[i]);
        this._lCovers[i] = null;
      }
    }
    this._lCovers = null;
    this._lCovers = lRemainingCovers;
    if (bDeleted){
      // A cover has been deleted in this container. Its size may have to change.
      this.setHeight(iSlotsPerLine);
    }
  },

  purge : function() {
    for (var i = 0; i < this._lCovers.length; i++) {
      this._lCovers[i].purge();
      this._lCovers[i] = null;
    }
    this._lCovers = null;
    this._$container.empty().remove();
    this._oGlobalDispatcher = null;
  }

});
