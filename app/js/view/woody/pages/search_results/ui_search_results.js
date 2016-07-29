'use strict';

/**
 * SearchResults is the a page that displays all the matching stories for a specific search.
 * example: woody.html?q=css
 * contains one shelf with all the matching stories.
 */
Cotton.UI.Pages.SearchResults = Class.extend({

  /**
   * {Cotton.Messaging.Dispatcher}
   * General Dispatcher that allows two diffent parts of the product to
   * communicate together through the controller of the app.
   */
  _oGlobalDispatcher : null,

  /**
   * {DOM}
   * manager element, contains all the shelves.
   */
  _$search_results : null,

  /**
   * Cotton.UI.Library.Shelf.UIShelf _oShelf: a shelf that has a title the search request,
   * that contains all the matching stories.
   */
  _oShelf : null,

  /**
   * Constructor
   */
  init : function (oShelf, oGlobalDispatcher) {
    this._oShelf = oShelf;
    this._oGlobalDispatcher = oGlobalDispatcher;

    this._$search_results = $('<div class="ct-page"></div>');
    var $timeline = $('<div class="ct-timeline"></div>');
    this._$container = $('<div class="ct-shelves_container"></div>');
    this._$no_story = $('<div class="ct-no_story">No Story matching your search.</div>');
    this._$load_more = $('<div class="ct-footer ct-load_more">Loading More...</div>');

    this._$search_results.append(this._$container);


    var oUIShelf = new Cotton.UI.Library.Shelf.UIShelf(oShelf, this._oGlobalDispatcher);
    this._$container.append(oUIShelf.$());
    if (oShelf.stories().length === 0) {
      this._$container.append(this._$no_story);
    }
    this._$search_results.append($timeline.append(this._$container));

  },

  $ : function () {
    return this._$search_results;
  },

  purge : function () {
    this._oGlobalDispatcher = null;
    this._oShelf = null;
    this._$search_results.remove();
    this._$search_results = null;
  }
});
