require ('db/');
require ('translators/');


angular.module('databaseService', [])
.service('databaseService', function($q) {

  var self = this;

  this.database = function() {
    var deferred = $q.defer();

    if (self._oDatabase) {
      deferred.resolve(self._oDatabase);
    } else {
      self._oDatabase = new Cotton.DB.IndexedDB.Wrapper('ct', {
        'stories' : Cotton.Translators.STORY_TRANSLATORS,
        'historyItems' : Cotton.Translators.HISTORY_ITEM_TRANSLATORS,
        'searchKeywords' : Cotton.Translators.SEARCH_KEYWORD_TRANSLATORS,
        'cheesecakes' : Cotton.Translators.CHEESECAKE_TRANSLATORS
      }, function() {
        deferred.resolve(self._oDatabase);
      });
    }
    return deferred.promise;
  };

  /**
   * Get stories by batch from the database. But only get non empty stories.
   *
   * @param {Int}
   *        iStartStories: number of stories already in the manager.
   * @param {Float}
   *        fLastVisitTime: the max fLastVisitTime we accept. (strict is true by
   *        default so we don't take twice the same story.
   */
   this._getStoriesByBatch = function(fLastVisitTime, iBatchSize, mCallback) {
      // loads a b(i)atch of iBatchSize stories.
      // TODO(rkorach) see if we cannot speed the performance + percieved speed up.

      self._oDatabase.getXItemsWithUpperBound('stories', iBatchSize,
          'fLastVisitTime', 'PREV', fLastVisitTime, true,
          function(lStories) {
            // For each story get all the corresponding historyItems.
            var iCount = 0;
            var iLength = lStories.length;
            // In this case we arrived at the end of the database.
            var bNoMoreStories = false;
            if (iLength < iBatchSize){ bNoMoreStories = true; }
            if (iLength === 0) {
              mCallback(lStories, bNoMoreStories);
              return;
            } else {
              mCallback(lStories, bNoMoreStories);
            }
        });
    };
});
