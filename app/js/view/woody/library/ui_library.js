"use strict";

/**
 * The library contains all your stories sorted by shelves.
 * By default shelves are sorted by time. Each shelf contains all the stories that corresponds to this timeline.s
 */
Cotton.UI.Library.UILibrary = Class.extend({
    /**
     * {Cotton.} General Dispatcher that allows two diffent parts of the product to communicate
     * together through the controller of the app.
     */
  _oGlobalDispatcher: null,

  /**
   * {DOM} current element that grab the whole library.
   */
  _$library: null,

  /**
   * Array<Cotton.UI.Library.Shelf> _lShelves: list of shelves,
   * Each shelf can contains a specific amount of stories and a dedicated title.
   */
  _lShelves : null,

  /**
   * {Date}
   * date when the manager is open it's the reference.
   */
  _oNow : null,

  /**
   * {int}
   * last width of the container. Stored in case the manager is detached
   * because then the $container has a size == 0
   */
  _iContainerWidth : null,

  /**
   * Constructor called by new
   */
  init : function(oGlobalDispatcher) {
    this._oGlobalDispatcher = oGlobalDispatcher;
    this._lShelves = [];
    this._lStickers = [];

    this._$library = $('<div class="ct-library"></div>');
    this._$library_container = $('<div class="ct-library_container"></div>');

    this._$library.append(
      this._$library_container
    )
  },

  $ : function() {
    return this._$library;
  },

  /**
   * drawShelves
   * @param {Array<Cotton.Model.Shelf>} lShelves, contains a list of shelves you want to display.
   * shelf object contains a title and a list of stories.
   */
   drawShelves: function (lShelves) {
        var iLength = lShelves.length;
        for (var i = 0; i < iLength; i++) {
            var oShelf = new Cotton.UI.Library.Shelf.UIShelf(lShelves[i], this._oGlobalDispatcher);
            this._lShelves.push(oShelf);
            this._$library_container.append(oShelf.$());
        }
   },

  /**
   * drawCheesecakes
   * Cheesecakes are some kind of stories.
   */
  drawCheesecakes : function(lCheesecakes) {
    var iLength = lCheesecakes.length;
    for (var i = 0; i < iLength; i++) {
      var oSticker = new Cotton.UI.Stand.Common.Sticker(lCheesecakes[i], 'library', this._oGlobalDispatcher);
      this._lStickers.push(oSticker);
      this._$library_container.append(oSticker.$());
    }
  },

  removeCheesecake : function(iId) {
    var lNewStickers = [];
    var iLength = this._lStickers.length;
    for (var i = 0; i < iLength; i++) {
      if (this._lStickers[i].id() === iId) {
         this._lStickers[i].purge();
      } else {
        lNewStickers.push(this._lStickers[i]);
      }
      this._lStickers[i] = null;
    }
    this._lStickers = lNewStickers;
  },

  _purgeStickers : function() {
    var iLength = this._lStickers.length;
    for (var i = 0; i < iLength; i++) {
      this._lStickers[i].purge();
      this._lStickers[i] = null;
    }
    this._lStickers = null;
  },

  purge : function() {
    this._oGlobalDispatcher.unsubscribe('window_resize', this);
    this._oGlobalDispatcher = null;
    this._purgeStickers();
    this._$library.remove();
    this._$library = null;
  }
});
