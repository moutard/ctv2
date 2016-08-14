require ('db/');
require ('translators/');
require ('utils/');


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

});
