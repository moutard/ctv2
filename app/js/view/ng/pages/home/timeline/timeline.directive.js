angular.module('timeline', ['storyService'])
.directive('ctTimeline', function($q, storyService) {
    return {
        restrict: 'E',
        template: require('./timeline.directive.html'),
        controller: controller
    };

    function controller ($scope) {
      var self = this;
      // Reference date :
      // We take tomorrow midnight as a reference because "today" is defined as
      // "everything before tomorrow". fTomorrow need to be a attribut in a
      // specific case : you load the interface today and keep it open, the you
      // load more stories the next day. fTomorrow need to be constant.
      // TODO (rmoutard): force the reload if fTomorrow change.
      // set today's date as a reference for timestamps
      $scope._oNow = new Date();

      $scope._iCurrentPeriodIndex = null;

      $scope.shelves = [];

      constructTimeline({}, $scope).then(function (lShelves) {
        $scope.shelves = lShelves;
      });
    }

    function constructTimeline (dArguments, scope) {
      var deferred = $q.defer();

      var fLastVisitTime = dArguments['fLastVisitTime'] || new Date().getTime();

      storyService.getStoriesByBatch(fLastVisitTime, 20).then(function (lStories, bNoMoreStories) {
        var lShelves = createShelves(lStories, scope);
        deferred.resolve(lShelves);
      });

      return deferred.promise;
    }

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
  function createShelves(lStories, scope) {

    // SHELVES
    var lSHELVES = [];
    var oNow = scope._oNow;
    var fTomorrow = new Date(oNow.getFullYear(), oNow.getMonth(),
        oNow.getDate() + 1, 0, 0, 0, 0).getTime();

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

    // Given an index of period return the corresponding threshold.
    // below this threshold the timestamp belongs to this period.
    var getThreshold = function(iIndex) {
      if (iIndex < PERIODS.length) {
        // a period predefined.
        return PERIODS[iIndex];
      } else {
        // a month period.
        var iNextMonth = iIndex - (PERIODS.length - 1);
        return fTomorrow - new Date(oNow.getFullYear(),
            oNow.getMonth() - iNextMonth, 0, 24, 0, 0, 0).getTime();
      }
    };

    var isCompleteMonth = function(iIndex) {
      return iIndex >= PERIODS.length;
    };

    // Initialize period index, threshold and group of stories.
    // periodIndex corresponds to the PERIODS
    var iCurrentPeriodIndex = scope._iCurrentPeriodIndex || 0;
    var iThreshold = getThreshold(iCurrentPeriodIndex);
    var bIsCompleteMonth = isCompleteMonth(iCurrentPeriodIndex);


    var lStoriesForPeriod = [];

    // For each stories find the corresponding period and add it.
    // Stories are sorted by time coming from the database, so every time a story
    // doesn't fit the current period you increase the period index.
    for (var i = 0, iLength = lStories.length; i < iLength; i++) {
      var oStory = lStories[i];
      if (fTomorrow - oStory.lastVisitTime() <= iThreshold) {
        // Stories belongs to the current period.
        lStoriesForPeriod.push(oStory);
      } else {
        // stories doesn't belong to the current period. So create a shelf and increase the period index.
        if (lStoriesForPeriod.length > 0) {
          lSHELVES.push({
            title: _computeTitle(fTomorrow, lStoriesForPeriod[0].lastVisitTime(), bIsCompleteMonth),
            stories: lStoriesForPeriod
          });

          // Reset the stories for period and add the current story.
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
      lSHELVES.push({
        title: _computeTitle(fTomorrow, lStoriesForPeriod[0].lastVisitTime(), bIsCompleteMonth),
        stories: lStoriesForPeriod
      });
    }
    // As iCurrentPeriodIndex is the next possible period, but we want to allow
    // the interface to add stories at the last shelf, so we need to
    // decrease by one iCurrentPeriodIndex.
    scope._iCurrentPeriodIndex = iCurrentPeriodIndex;
    return lSHELVES;
  }

  /**
 * Given the reference and the time of the shelf return the title that
 * will be display (like TODAY, YESTERDAY 3 MONTHS AGO).
 * @param {float}
 *          fTomorrow: reference date.
 * @param {float}
 *          fTime: time of the last visit time of elements in the shelf.
 */
function _computeTitle(fTomorrow, fTime, bIsCompleteMonth) {
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
};

});
