'use strict';

/**
 * Home is the main UI element of the homepage.
 * in the future this will be customizable by the user using his preferences. But for now it contains:
 * - the library
 * - the timeline
 * - the igniter
 */
Cotton.UI.Stand.Home.UIHome = Class.extend({

  /**
   * {DOM} current homepage element.
   */
  _$home: null,

  /**
   * {Cotton.UI.Library.UILibrary}
   * Library object, contains custom shelves of the user.
   */
  _oLibrary: null,

  /**
   * {Cotton.UI.Library.Timeline}
   * Timeline object, representing the home, containing all covers grouped by shelves in chronological order.
   * there is only one timeline, and it is hidden/shown if needed
   */
  _oTimeline : null,

  /**
   * {Cotton.UI.Stand.Home.Igniter}
   * Igniter is to manually create story.
   */
  _oIgniter: null,

  init : function(oGlobalDispatcher) {
    this._oGlobalDispatcher = oGlobalDispatcher;

    this._$home = $('<div class="ct-home"></div>');
    this._oIgniter = new Cotton.UI.Stand.Home.Igniter.UIIgniter(oGlobalDispatcher);
    this._oLibrary = new Cotton.UI.Library.UILibrary(oGlobalDispatcher);
    this._oTimeline = new Cotton.UI.Library.Timeline(oGlobalDispatcher);

    this._$home.append(this._oLibrary.$(), this._oTimeline.$());

    this._oGlobalDispatcher.publish('start_homescreen');

    var MAX_THEMES = 18;

    this._oGlobalDispatcher.subscribe('fill_homescreen', this, function(dArguments){
      this._lStories = dArguments['stories'];
      this._lCheesecakes = dArguments['cheesecakes'];
    });

    this._oGlobalDispatcher.subscribe('show_more_suggested_themes', this, function(dArguments){
      this._oSuggestor = new Cotton.UI.Stand.Home.ThemeSuggestor.UIThemeSuggestor(oGlobalDispatcher);
      this._oSuggestor.drawSuggestions(this._lStories.slice(2, this._lStories.length), false);
      this._oIgniter.$().after(this._oSuggestor.$());
    });

    this._oGlobalDispatcher.subscribe('hide_more_suggested_themes', this, function(dArguments){
      this._oSuggestor.purge();
      this._oSuggestor = null;
    });

    this._oGlobalDispatcher.subscribe('delete_theme_suggestion', this, function(dArguments){
      var iDeletedStoryId = dArguments['story_id'];
      var iLength = this._lStories.length;
      var lTempStories = [];
      var iIndex;
      for (var i = 0; i < iLength; i++) {
        if (this._lStories[i].id() === iDeletedStoryId) {
          iIndex = i;
        } else {
          lTempStories.push(this._lStories[i]);
        }
      }
      this._lStories = lTempStories;
      this.refreshSuggestions(iIndex);
    });

  },

  $ : function() {
    return this._$home;
  },

  refreshSuggestions : function(iIndex) {
    if (iIndex < 2) {
      this._oIgniter.refreshSuggestions(this._lStories);
      if (this._oSuggestor) {
        this._oSuggestor.pop();
      }
    } else {
      if (this._oSuggestor) {
        this._oSuggestor.pop(iIndex);
      }
    }
  },

  removeCheesecake : function(iId) {
    this._oLibrary.removeCheesecake(iId);
  },

  purge : function() {
    this._oGlobalDispatcher.unsubscribe('fill_homescreen', this);
    this._oGlobalDispatcher.unsubscribe('show_more_suggested_themes', this);
    this._oGlobalDispatcher.unsubscribe('hide_more_suggested_themes', this);
    this._oGlobalDispatcher.unsubscribe('delete_theme_suggestion', this);
    this._oGlobalDispatcher = null;
    this._oIgniter.purge();
    this._oIgniter = null;
    this._oLibrary.purge();
    this._oLibrary = null;
    this._$home.remove();
    this._$home = null;
  }

});
