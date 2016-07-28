'use strict';
var UrlParser = require ('utils/url_parser.js');
/**
 * This is a kind of router for woody.
 * basically it listens for all the "push_state" messages that tells when the url has changed. (rq: we manually
 * sends a push_state event. So we could forget to do it. That's why it's safer to use a lib like
 * - https://millermedeiros.github.io/crossroads.js/
 * - http://riotjs.com/api/route/
 * that automatically listen for any change.
 * For every push_state events it will
 * - parse the url
 * - find the corresponding action to call
 * - send a specific message using the globalDispatcher (rq: only publishes all the subscribe would be in dispatching_controller.
 * - add the new url to the historyState so we can come back to it.
 *
 * Rq: some actions will not change the url. But I think we should always change the url. It's make the app easier to
 * navigate.
 */
Cotton.Controllers.Mopstater = Class.extend({

  /**
   * {int} remember the place is the history tree
   * useful to know how many previous or next states exist
   */
  _iHistoryState : null,

  /**
   * Constructor.
   */
  init: function(oMoController, oGlobalDispatcher) {
    var self = this;
    this._oMoController = oMoController;
    this._oGlobalDispatcher = oGlobalDispatcher;

    oGlobalDispatcher.subscribe('window_ready', this, function() {
      if (!oMoController._oWorld.isReady()) {
        // Db was ready before window.
        oMoController._oWorld.createWorld();
      }
      self._handlePopstate();
    });

    if (oMoController._oWorld.isReady()) {
      // Window was ready before Db.
      self._handlePopstate();
    }

    oGlobalDispatcher.subscribe('window_popstate', this, function(dArguments) {
      if (!dArguments['first_popstate']) {
        // The first _handlePopstate is done "manually" (at init) to avoid async problems
        // if the window.popstate event occurs before or after the popstater is created.
        self._handlePopstate();
      }
    });

    // TODO: replace by a router library.
    oGlobalDispatcher.subscribe('push_state', this, function(dArguments) {
      // When we go to a new page, we setup the offset to 0.
      // However if you go back in history you should find the previous offset.
      this._oGlobalDispatcher.publish('scrolloffset', {'scroll': 0});
      this._iHistoryState++;

      // TODO: use a url concatenor and escape arguments.
      this.pushState(chrome.extension.getURL("woody.html") + dArguments['code'] + dArguments['value'],
        this._iHistoryState);
      // will set the navigation arrows
      this.updateHistoryArrows();
    });

    oGlobalDispatcher.subscribe('previous_page', this, function(){
      // the UI 'previous' button has been clicked
      window.history.back();
    });

    oGlobalDispatcher.subscribe('next_page', this, function(){
      // the UI 'next' button has been clicked
      window.history.forward();
    });
  },

  /**
   * _handlePopstate does 2 things
   *    - store the new url in the history state.
   *    - Route the url to the correct actions.
   *    TODO: replace by a router library.
   */
  _handlePopstate : function() {
    var self = this;

    // Will ask the world to clear the content of the page (except topbar and footer)
    this._oGlobalDispatcher.publish('clear');

    var dState = window.history.state;

    if (dState) {
      // we land on the UI with already a custom history state
      // for example if you refresh the page
      self._iHistoryState = dState['count'];
    } else {
      // we land on the UI from a fresh page, replace the default history state by our
      // custom state
      self._iHistoryState = window.history.length;
      self.replaceState(window.location.href, self._iHistoryState);
      dState = window.history.state;
    }
    // will set the navigation arrows
    self._oGlobalDispatcher.publish('change_history_state', {
      'state': self._iHistoryState,
      'history_length': window.history.length
    });


    // Routing part. Depending on the url this will call a specific actions.
    var oUrl = new UrlParser(dState['path']);
    oUrl.fineDecomposition();

    if (oUrl.dSearch['did']) {
      // Open on a cheesecake with a specific id.
      // TODO: escape the url.
      var iCheesecakeId = parseInt(oUrl.dSearch['did']);
      self._oMoController._oDatabase.find('cheesecakes', 'id', iCheesecakeId, function(oCheesecake){
        self._oMoController.fillStory(oCheesecake, function(oFilteredCheesecake){
          if (!oFilteredCheesecake) {
            // If the id doesn't match any cheesecake then rolback to the home page.
            // Analytics tracking.
            Cotton.ANALYTICS.navigate('manager_fallback');
            self.replaceState(chrome.extension.getURL("woody.html"), self._iHistoryState);
            self._oGlobalDispatcher.publish('home', {
              'from_popstate': true,
            });
            self._oGlobalDispatcher.publish('scrolloffset', {'scroll': 0});
          } else {
            // If the id mathes a cheesecacke then open the cheesecake.
            // Analytics tracking.
            Cotton.ANALYTICS.navigate('cheesecake');
            self._oGlobalDispatcher.publish('open_cheesecake', {
              'cheesecake': oFilteredCheesecake
            });
            self._oGlobalDispatcher.publish('scrolloffset', {'scroll': dState['scroll']});
          }
        });
      });
    } else if (oUrl.dSearch['sid']){
        // Open on a story with a specific id.
        // TODO: escape properly arguments.
        var iStoryId = parseInt(oUrl.dSearch['sid']);
        self._oMoController._oDatabase.find('stories', 'id', iStoryId, function(oStory) {
          self._oMoController.storyHandler().fillStory(oStory, function(oFilteredStory) {
            if (!oFilteredStory) {
              // If the id doesn't match any cheesecake then rolback to the home page.
              // Analytics tracking.
              Cotton.ANALYTICS.navigate('manager_fallback');
              self.replaceState(chrome.extension.getURL("woody.html"), self._iHistoryState);
              self._oGlobalDispatcher.publish('home', {
                'from_popstate': true,
              });
              self._oGlobalDispatcher.publish('scrolloffset', {'scroll': 0});
            } else {
              // analytics tracking.
              Cotton.ANALYTICS.navigate('story');
              self._oGlobalDispatcher.publish('enter_story', {
                'story': oStory
              });
              self._oGlobalDispatcher.publish('scrolloffset', {'scroll': dState['scroll']});
            }
          });
        });
      } else if (oUrl.dSearch['q']) {
        // Search page.
        self._oGlobalDispatcher.publish('search_stories', {
          'search_words': oUrl.dSearch['q'].split('+').join(' ')
        });
        // analytics tracking.
        Cotton.ANALYTICS.navigate('search');
      } else if (oUrl.dSearch['p'] === 'favorites'){
        // favorites page.
        self._oGlobalDispatcher.publish('favorites');
      } else {
        // analytics tracking.
        Cotton.ANALYTICS.navigate('home');
        // open on the manager
        self._oGlobalDispatcher.publish('home', {
            'from_popstate': true
        });
      }
  },

  /**
   * @param {string} sUrl: information about the page to trigger (query, manager, story,...)
   * @param {int} iHistoryState: position of the page in the history tree
   */
  pushState : function(sUrl, iHistoryState){
    // analytics tracking
    Cotton.ANALYTICS.depth(iHistoryState);

    // we can store information in this if needed!
    history.pushState({
      path: sUrl,
      count: iHistoryState
    }, '', sUrl);
  },


  /**
   * @param {string} sUrl: information about the page to trigger (query, manager, story,...)
   * @param {int} iHistoryState: position of the page in the history tree
   */
  replaceState : function(sUrl, iHistoryState){
    history.replaceState({
      path: sUrl,
      count: iHistoryState
    }, '', sUrl);
  },

  /**
   * Sends a message to the history arrows to update to the right color (active/inactive)
   */
  updateHistoryArrows : function() {
    this._oGlobalDispatcher.publish('change_history_state', {
      'state': this._iHistoryState,
      'history_length': window.history.length
    });
  }

});
