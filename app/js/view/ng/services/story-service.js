require ('db/');
require ('translators/');
require ('utils/');


angular.module('storyService', ['databaseService'])
.service('storyService', function($q, databaseService) {

  var self = this

  /**
   * Get stories by batch from the database. But only get non empty stories.
   *
   * @param {Int}
   *        iStartStories: number of stories already in the manager.
   * @param {Float}
   *        fLastVisitTime: the max fLastVisitTime we accept. (strict is true by
   *        default so we don't take twice the same story.
   */
   this.getStoriesByBatch = function(fLastVisitTime, iBatchSize) {
      // loads a b(i)atch of iBatchSize stories.
      // TODO(rkorach) see if we cannot speed the performance + percieved speed up.
      var deferred = $q.defer();

      databaseService.database().then(function (oDatabase) {
        oDatabase.getXItemsWithUpperBound('stories', iBatchSize,
            'fLastVisitTime', 'PREV', fLastVisitTime, true,
            function(lStories) {
              // For each story get all the corresponding historyItems.
              var iCount = 0;
              var iLength = lStories.length;
              // In this case we arrived at the end of the database.
              var bNoMoreStories = false;
              if (iLength < iBatchSize){ bNoMoreStories = true; }
              if (iLength === 0) {
                deferred.resolve(lStories, bNoMoreStories);
                return;
              } else {
                deferred.resolve(lStories, bNoMoreStories);
              }
          });
      });

      return deferred.promise;
    };

    /**
     * Get story by id from the database.
     *
     * @param {Int}
     *        iStoryId: story id.
     */
     this.getStoriesById = function(iStoryId) {
        var deferred = $q.defer();

        databaseService.database().then(function (oDatabase) {
          oDatabase.find('stories', 'id', iStoryId, function(oStory) {
              oDatabase.search('historyItems', 'sStoryId', oStory.id(),
              function(lHistoryItems, iStoryId) {
                  // Set the historyItems of the story.
                  var lHistoryItemsSortedByVisitTime = lHistoryItems.sort(function(a,b) {
                    return b.lastVisitTime() - a.lastVisitTime();
                  });
                  oStory.setHistoryItems(lHistoryItemsSortedByVisitTime);
                  deferred.resolve(oStory);
              });
          });
        });
        return deferred.promise;
      };

  this.fillStory = function(oStory) {
    // if no story, send back null useful in the popstate controller, if we try to go to
    // the page of a story that does not exist
    if (!oStory) {
      mCallback(null);
      return;
    }
    // get all historyItems in this story using the base as a relational database
    self._oDatabase.search('historyItems', 'sStoryId',
      oStory.id(), function(lHistoryItems, iStoryId) {
        // Set the historyItems of the story.
        oStory.setHistoryItems(
          // Filter the items, and sort them by lastVisitTime
          self._filterHistoryItems(
            lHistoryItems.sort(function(a,b) {
              return b.lastVisitTime() - a.lastVisitTime();
            })
          )
        );
        mCallback(oStory);
    });
  };

  /**
   * For a given story, set its list of historyItems without search pages,
   * youtube searches redundant maps or redundant images from image search
   * results + actual image url.
   *
   * @param {Array.<Cotton.Model.HistoryItems>}
   *        lHistoryItems: story that contains historyItems you want to filter.
   */
  this._filterHistoryItems = function(lHistoryItems) {
    var self = this;

    // List of Cotton.Model.HistoryItem that are in the story and not exluded.
    var lHistoryItemsFiltered = [];

    // Use as a unique key to avoid duplicate elements.
    // Rq: historyItems are already unique by url, but when it's an image search
    // the image url can be the same but not the whole url.
    var lUrls = [];
    var lMapsSearch = [];
    var iLength = lHistoryItems.length;
    for (var i = 0; i < iLength; i++) {
      var oHistoryItem = lHistoryItems[i];
      var oUrl = oHistoryItem.oUrl();
      oUrl.fineDecomposition();
      // We filter google and Youtube searches, plus we eliminate redundancy
      // in images or maps.
      // FIXME(rmoutard -> rkorach): maybe use a specific method in
      // ExcludeContainer.
      if (!(oUrl.isGoogle && oUrl.dSearch)
        && !(oUrl.isYoutube && oUrl.dSearch['search_query'])
        || oUrl.isGoogleMaps
        || oUrl.searchImage) {
          if (oUrl.searchImage) {
            // Google image result, check if there is not already the image
            // itself in the url list
            if (lUrls.indexOf(oUrl.searchImage) === -1) {
              lUrls.push(oUrl.searchImage);
              lHistoryItemsFiltered.push(oHistoryItem);
            }
          } else if (oUrl.isGoogleMaps && (oUrl.dHash['!q'] || oUrl.dSearch['q'])) {
            // New or old google maps, keep only one page per query, independant of
            // the change of coordinates.
            var sMapCode = (oUrl.dHash['!q']) ? oUrl.dHash['!q'] : oUrl.dSearch['q'];
            if (lMapsSearch.indexOf(sMapCode.toLowerCase()) === -1) {
              lMapsSearch.push(sMapCode.toLowerCase());
              lHistoryItemsFiltered.push(oHistoryItem);
            }
          } else if (!oUrl.isGoogleMaps){
            // The map condition is because there are sometimes a lot of maps url
            // just with google.com/maps/preview#!data=3876582379281635767kjfzmj837L23U5Y3
            // useless.
            // Primarily for images, to avoid redundancy with google images
            // search.
            if (lUrls.indexOf(oUrl.href) === -1) {
              lUrls.push(oUrl.href);
              lHistoryItemsFiltered.push(oHistoryItem);
            }
          }
      }
    }
    return lHistoryItemsFiltered;
  };

});
