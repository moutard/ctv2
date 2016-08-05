require ('db/');

angular.module('databaseService', [])
.service('databaseService', function() {

  this._oDatabase = new Cotton.DB.IndexedDB.Wrapper('ct', {
    'stories' : Cotton.Translators.STORY_TRANSLATORS,
    'historyItems' : Cotton.Translators.HISTORY_ITEM_TRANSLATORS,
    'searchKeywords' : Cotton.Translators.SEARCH_KEYWORD_TRANSLATORS,
    'cheesecakes' : Cotton.Translators.CHEESECAKE_TRANSLATORS
  }, function() {

  });

  this.database = function() {
    return this._oDatabase;
  };
});
