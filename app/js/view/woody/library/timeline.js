"use strict";

/**
 * Timeline is a UI element that displays stories grouped in shelves sorted by chronological order (from newest to oldest).
 * Each shelf corresponds to a specific period (timerange).
 *    Available periods are:
 *    TODAY, YESTERDAY, 2 DAYS AGO, .. A WEEK AGO, 2 WEEKS AGO, then month by month.
 *
 * The timeline get stories by publishing a message "need_more_stories".
 * This message is received by the main controller {Cotton.Controller.Mo}, that then publish a message "give_more_stories"
 * The message contains the time of the latest stories, to get only the remaining one.
 * - the timeline as a custom infinit scrolling.
 */
Cotton.UI.Library.Timeline = Class.extend({

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
  _$timeline : null,

  /**
   * Array<Cotton.UI.Library.Shelf.UIShelf> _lShelves: list of shelves,
   * that contains time stamp and covers for corresponding stories.
   */
  _lShelves : null,

  /**
   * {Date}
   * date when the timeline was opened (used as a reference to automatically refresh).
   */
  _oNow : null,

  /**
   * {Bool}
   * Used to know if the _$timeline element is attached to the World DOM. If not we don't update it.
   */
  _bDetached : null,

  /**
   * {int}
   * last width of the container. Stored in case the manager is detached
   * because then the $container has a size == 0
   */
  _iContainerWidth : null,

  /**
   * Constructor.
   * @param {Array.<Cotton.Model.Story>}
   *            lStories
   * @param {Cotton.Messaging.Dispatcher}
   *            oGlobalDispatcher
   */
  init : function(oGlobalDispatcher) {
    var self = this;
    this._oGlobalDispatcher = oGlobalDispatcher;
    // Reference date :
    // We take tomorrow midnight as a reference because "today" is defined as
    // "everything before tomorrow". fTomorrow need to be a attribut in a
    // specific case : you load the interface today and keep it open, the you
    // load more stories the next day. fTomorrow need to be constant.
    // TODO (rmoutard): force the reload if fTomorrow change.
    // set today's date as a reference for timestamps
    this._oNow = new Date();

    this._lShelves = [];

    // DOM object for the manager.
    this._$timeline = $('<div class="ct-timeline"></div>');
    this._$container = $('<div class="ct-shelves_container"></div>');
    this._$no_story = $('<div class="ct-no_story">YOU DON\'T HAVE ANY STORY YET, START BROWSING AND SEE YOUR STORIES BUILD OVER TIME.</div>');
    this._$load_more = $('<div class="ct-footer ct-load_more">Loading More...</div>');

    this._$timeline.append(this._$container);

    this._$load_more.appendTo(this._$timeline).hide();

    /**
     * Simulate infinite scrolling.
     * When you scroll at the end of the timeline, it sends a message to request more stories.
     */
    this._oGlobalDispatcher.subscribe('window_scroll', this, function(dArguments) {
      // TODO (rmoutard) avoid hardcoded value.
      if (self._bReadyToLoad && !self._bDetached &&
        (dArguments['scroll_top'] > self._$timeline.height() - dArguments['height'] - 100)) {
          self._oGlobalDispatcher.publish('need_more_stories', {
            'fLastVisitTime': self.timerangeBetweenStories()['last']['lastVisitTime']
          });
          self._loading();
      }
    });

    /**
     * Listen to this message sent by the main controller. When needs to put more stories in the timeline.
     * @param {Dict} dArguments
     *  - lStories: {Array<Cotton.Model.Story>} mandatory
     *  - bNoMoreStories: {Bool}
     */
    this._oGlobalDispatcher.subscribe('give_more_stories', this, function(dArguments) {
      // TODO (rmoutard) why do you need a timeout.
      var iTimeout = (self._lShelves.length === 0) ? 0 : 600;
      setTimeout(function() {
        self.createShelves(dArguments['lStories']);
        self._bReadyToLoad = true;
        if (dArguments['bNoMoreStories']) {
          self._endOfManager();
        } else {
          self.fillScreen();
        }
      }, iTimeout);
    });

    this._oGlobalDispatcher.subscribe('remove_cover', this, function(dArguments){
      this.removeCoverFromShelves(dArguments['story_id']);
      if (!this._bEnd) {
        self.fillScreen();
      }
    });

    /**
     * Initialization.
     * Ask for the first batch of stories.
     * fLastVisitTime is the current date to fet all the stories.
     */
    this._oGlobalDispatcher.publish('need_more_stories', {
      'fLastVisitTime': new Date().getTime()
    });
  },

  $ : function() {
    return this._$timeline;
  },

  purge : function() {
    this._oGlobalDispatcher = null;

    this._$no_story.remove();
    this._$no_story = null;

    this._$timeline.remove();
    this._$timeline = null;
  },

  /**
   * Each shelf can store a variable amount of stories. So return the
   * total number of stories in the manager. it's simply the sum of all the
   * stories by each shelf.
   */
  _numberOfStories : function() {
    var iNumberOfStories = 0;
    for (var i = 0, iLength = this._lShelves.length; i < iLength; i++) {
      iNumberOfStories += this._lShelves[i].numberOfStories();
    }
    return iNumberOfStories;
  },

  /**
   * Construct only one Shelf and add them to the DOM $manager element.
   *
   * This method allow to split the code of createShelves. Just make it clear.
   *
   * @param {Float} fTomorrow:
   *        milliscond since epoch.
   *
   * @param {Int} iCurrentPeriodIndex:
   *        index that allow us to know if there is a already a shelf that can
   *         get those stories.
   *
   * @param {Array.<Cotton.Model.Stories>} lStoriesForPeriod:
   *        array of stories you want to add to the shelf.
   *
   * @param {Boolean} bIsCompleteMonth:
   *        true if the shelf is a complete month.
   */
  _constructShelf : function(fTomorrow, iCurrentPeriodIndex, lStoriesForPeriod, bIsCompleteMonth) {

    // If the indexes are different it means we need to create a new shelf.
    if (iCurrentPeriodIndex !== this._iCurrentPeriodIndex) {
      // New shelf.
      var iLength = this._lShelves.length;
      if (iLength > 0) {
        // If there was a previous shelf, we mark it as complete.
        // We need it not  to delete a shelf that has no more covers, but could have
        // some more by loading more stories.
        var lastShelf = this._lShelves[iLength - 1];
        lastShelf.setComplete();
        if (lastShelf.numberOfStories() === 0) {
          // The last shelf was empty, and now we know it is complete, so we can delete it.
          this.collapseShelf(lastShelf);
          // Remaining shelves without the deleted one.
          var remainingShelves = [];
          for (var i = 0; i < iLength - 1; i++) {
            remainingShelves.push(this._lShelves[i]);
            this._lShelves[i] = null;
          }
          this._lShelves[iLength - 1] = null;
          this._lShelves = null;
          this._lShelves = remainingShelves;
        }
      }
      // Create new shelf Model object
      var oShelf = new Cotton.Model.Shelf();
      oShelf.setTitle(this._computeTitle({
        'tomorrow': fTomorrow,
        'time': lStoriesForPeriod[0].lastVisitTime(),
        'isCompleteMonth': bIsCompleteMonth
      }));


      var oUIShelf = new Cotton.UI.Library.Shelf.UIShelf(oShelf, this._oGlobalDispatcher);
      DEBUG && console.debug("New shelf contains: " + lStoriesForPeriod.length);
      this._lShelves.push(oUIShelf);
      this._$container.append(oUIShelf.$());
    }

    // If the indexes are different we push a new shelf in the array _Shelves.
    // So when we add here, if indexes are different we add to the new shelf, else we add to the latest shelf.

    // TODO: remove computeSlots.
    // We put the number of slots in parameter of addStories
    // because having _computeSlots in manager lets us compute it once only
    // every time we need it, instead of once in every shelf.
    this._lShelves[this._lShelves.length -1].addStories(lStoriesForPeriod, this._computeSlots());
  },

  /**
   * Group stories by date and for each group create a shelf.
   *
   * If the shelf already exists, and the stories can be append to it,
   * then add those stories directly in the shelf.
   *
   * @param {Array.<Cotton.Model.Stories>}
   *            lStories: list of stories to put in shelves.
   *            ONLY WORKS IF lStories is SORTED by lastVisitTime most recent
   *            first.
   */
  createShelves : function(lStories) {
    this._unloading();
    var oNow = this._oNow; // Use a local variable for performance issues.
    var fTomorrow = new Date(oNow.getFullYear(), oNow.getMonth(),
        oNow.getDate() + 1, 0, 0, 0, 0).getTime();

    // TODO: use moment.js
    var ONE_DAY = 86400000; // Millisecond in one day.
    var ONE_WEEK = 604800000; // Millisecond in one week.
    var ONE_MONTH = fTomorrow - new Date(oNow.getFullYear(),
        oNow.getMonth() - 1, 1, 0, 0, 0, 0).getTime();
    // PERIODS represents the threshold of all the periods we want to display.
    // There is a gap between threshold and the display title:
    //  - ONE_DAY -> TODAY
    //  - 2*ONE_DAY -> YESTERDAY
    //  - ONE_MONTH -> earlier in month

    // After ONE_MONTH, all periods are display month by month.
    var PERIODS = [ONE_DAY, 2*ONE_DAY, 3*ONE_DAY, 4*ONE_DAY, 5*ONE_DAY,
        6*ONE_DAY, 7*ONE_DAY, 2*ONE_WEEK, 3*ONE_WEEK, ONE_MONTH];

    // Given an index of period return the corresponding threshold. (It doesn't
    // make sense to make this function a method of manager.)
    var getThreshold = function(iIndex) {
      if (iIndex < PERIODS.length) {
        return PERIODS[iIndex];
      } else {
        var iNextMonth = iIndex - (PERIODS.length - 1);
        return fTomorrow - new Date(oNow.getFullYear(),
            oNow.getMonth() - iNextMonth, 0, 24, 0, 0, 0).getTime();
      }
    };

    var isCompleteMonth = function(iIndex) {
      return iIndex >= PERIODS.length;
    };

    // Initialize period index, threshold and group of stories.
    var iCurrentPeriodIndex = this._iCurrentPeriodIndex || 0;
    var iThreshold = getThreshold(iCurrentPeriodIndex);
    var bIsCompleteMonth = isCompleteMonth(iCurrentPeriodIndex);
    var lStoriesForPeriod = [];

    // For each stories find the corresponding period and add it.
    for (var i = 0, iLength = lStories.length; i < iLength; i++) {
      var oStory = lStories[i];

      if (fTomorrow - oStory.lastVisitTime() <= iThreshold) {
        // Stories belongs to the current period.
        lStoriesForPeriod.push(oStory);
      } else {
        if (lStoriesForPeriod.length > 0) {
          this._constructShelf(fTomorrow, iCurrentPeriodIndex,
              lStoriesForPeriod, bIsCompleteMonth);
          lStoriesForPeriod = [];
          lStoriesForPeriod.push(oStory);
        }
        // Find the next period.
        while (fTomorrow - oStory.lastVisitTime() > iThreshold) {
          iCurrentPeriodIndex++;
          iThreshold = getThreshold(iCurrentPeriodIndex);
          bIsCompleteMonth = isCompleteMonth(iCurrentPeriodIndex);
          lStoriesForPeriod = []; // By security but not necessary.
        }
        lStoriesForPeriod.push(oStory);
      }
    }

    if (lStoriesForPeriod.length > 0) {
      this._constructShelf(fTomorrow, iCurrentPeriodIndex,
          lStoriesForPeriod, bIsCompleteMonth);
    }
    // As iCurrentPeriodIndex is the next possible period, but we want to allow
    // the interface to add stories at the last shelf, so we need to
    // decrease by one iCurrentPeriodIndex.
    this._iCurrentPeriodIndex = iCurrentPeriodIndex;

    if (this._lShelves.length === 0) {
      this._oGlobalDispatcher.unsubscribe('window_scroll', this);
      this._$timeline.append(this._$no_story);
      this._bEnd = true;
    }
  },

  fillScreen : function() {
    var TOPBAR_HEIGHT = 74;
    if (!this._bEnd && this._$container.height() + TOPBAR_HEIGHT <=  $(window).height()) {
      this._oGlobalDispatcher.publish('need_more_stories', {
        'fLastVisitTime': this.timerangeBetweenStories()['last']['lastVisitTime']
      });
      this._loading();
    }
  },

  _endOfManager : function() {
    var self = this;
    this._bEnd = true;
    var $end_of_history = $('<div class="ct-footer ct-end_of_history"></div>');
    this._$load_more.hide();


    this._$container.removeClass('ct-footer_spacer');
    this._$timeline.append($end_of_history);
    this._oGlobalDispatcher.unsubscribe('window_scroll', this);
  },

  /**
   * Display a loading message and make sure no one can modify the timeline.
   */
  _loading : function() {
    this._bReadyToLoad = false;
    this._$load_more.show();
    this._$container.removeClass('ct-footer_spacer');
  },

  /**
   * Hide the loading message.
   */
  _unloading : function() {
    this._bReadyToLoad = true;
    this._$load_more.hide();
    this._$container.addClass('ct-footer_spacer');
  },


  /**
   * We used to dynamically defined the number of columns (slots) in a shelf.
   * We can remove that for now.
   */
  _computeSlots : function() {
    // we store the manager width in case an operation is done while manager is detached.
    this._iContainerWidth = this._$container.width() || this._iContainerWidth;
    var COVER_WIDTH = 396;
    var COVER_MARGIN = 25;
    var EXTERNAL_BORDERS = 2;
    var MAX_COVERS = 3;
    var MIN_COVERS = 2;
    var MAX_INTERCOVERS = MAX_COVERS - 1;
    // The container can always have 2 or 3 covers per line
    var iSlotsPerLine = (this._iContainerWidth < (COVER_WIDTH * MAX_COVERS) + (COVER_MARGIN * MAX_INTERCOVERS) + EXTERNAL_BORDERS) ? MIN_COVERS : MAX_COVERS;
    return iSlotsPerLine;
  },

  setShelvesHeight : function(iSlotsPerLine) {
    var iLength = this._lShelves.length;
    for (var i = 0; i < iLength; i++) {
      this._lShelves[i].setHeight(iSlotsPerLine);
    }
  },

  removeCoverFromShelves : function(iStoryId) {
    var iLength = this._lShelves.length;
    // Remaining shelves if one is deleted for emptyness.
    var lRemainingShelves = [];
    for (var i = 0; i < iLength; i++) {
      // Remove the cover if it was in it
      this._lShelves[i].removeCoverFromShelf(iStoryId, this._computeSlots());
      if (this._lShelves[i].numberOfStories() === 0 && this._lShelves[i].isComplete()) {
        // The last cover has been removed and we know this shelf was complete.
        // So we can delete it.
        var shelfToCollapse = this._lShelves[i];
        this.collapseShelf(shelfToCollapse);
      } else {
        lRemainingShelves.push(this._lShelves[i]);
        this._lShelves[i] = null;
      }
    }
    this._lShelves = null;
    this._lShelves = lRemainingShelves;
  },

  collapseShelf : function(shelfToCollapse) {
    // Collapse the cover_container and the timestamp in 0.6s.
    shelfToCollapse.hide();
    setTimeout(function(){
      // We wait for the animation to be done, then we can purge the shelf.
      shelfToCollapse.purge();
      shelfToCollapse = null;
    }, 600);
  },

  hide : function() {
    this._$timeline.detach();
    this._bDetached = true;
  },

  isDetached : function() {
    return this._bDetached;
  },

  attached : function() {
    this._bDetached = false;
  },


  /**
   * Return the timerange between the first story of the first shelf (newest) and the latest story of the last shelf (oldest).
   */
  timerangeBetweenStories : function() {
    if (this._lShelves.length > 0) {
      // TODO(rmoutard): clean this.
      var oFirstStory = this._lShelves[0]._oShelfContent.first().story();
      var oLastStory = this._lShelves[this._lShelves.length - 1]._oShelfContent.last().story();
      return {
        'first': {
          'id': oFirstStory.id(),
          'lastVisitTime' : oFirstStory.lastVisitTime()
        },
        'last': {
          'id': oLastStory.id(),
          'lastVisitTime' : oLastStory.lastVisitTime()
        }
      };
    }
  },

  /**
   * Given the reference and the time of the shelf return the title that
   * will be display (like TODAY, YESTERDAY 3 MONTHS AGO).
   *
   *
   * @param {Dict} dArguments:
   *   - {float} fTomorrow: reference date. (date when we opened the timeline)
   *   - {float} fTime: time of the latest visit time of elements in the shelf.
   *   - {Bool}  isCompleteMonth: tells if the shelf corresponds to a complete month.
   * TODO: use moment.js
   */
   _computeTitle : function(dArguments) {
     var fTomorrow = dArguments['tomorrow'];
     var fTime = dArguments['time'];
     var bIsCompleteMonth = dArguments['isCompleteMonth'];
     // the reference is tomorrow 00:00
     var iDaysOld = Math.floor((fTomorrow - fTime) / 86400000);
     var sDate = "";
     if (iDaysOld === 0) {
       sDate = "TODAY";
     } else if (iDaysOld === 1) {
       sDate = "YESTERDAY";
     } else if (iDaysOld < 7) {
       sDate = iDaysOld + " DAYS AGO";
     } else if (iDaysOld < 14) {
       sDate = "A WEEK AGO";
     } else if (iDaysOld < 21) {
       sDate = "2 WEEKS AGO";
     } else {
       var MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
         "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
       sDate = MONTHS[new Date(fTime).getMonth()] + " " + new Date(fTime).getFullYear();
       if (!bIsCompleteMonth)  sDate = "EARLIER IN " + sDate;
     }
     return sDate;
   },

});
