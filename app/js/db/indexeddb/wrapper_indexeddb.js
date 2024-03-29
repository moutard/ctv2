'use strict';

require ('underscore');
require ('../wrapper');

/**
 * Absract layer for Cotton.DB.EngineIndexedDB.
 * This will call the Cotton.DB.Engine, then will use a translator to translate the object stored in the database (plain json)
 * into a javascript class with methods.
 * Every methods of the engine must be overwrite here.
 */
Cotton.DB.IndexedDB.Wrapper = Cotton.DB.Wrapper.extend({

  init : function(sDatabaseName, dTranslators, mOnReadyCallback) {
    var self = this;
    self._dTranslators = dTranslators;

    var dIndexesForObjectStoreNames = {};
    _.each(dTranslators, function(lTranslators, sObjectStoreName) {
      dIndexesForObjectStoreNames[sObjectStoreName] = self._lastTranslator(sObjectStoreName).indexDescriptions();
    });

    var oEngine = new Cotton.DB.IndexedDB.Engine(
        sDatabaseName,
        dIndexesForObjectStoreNames,
        function() {
          mOnReadyCallback.call(self);
    });

    this._oEngine = oEngine;

    self._super(sDatabaseName, dTranslators);

  },

  /**
   * Returns the last translator for the given type. Throws an exception if the
   * type does not have any translators.
   *
   * @param {String} sObjectStoreName:
   *  name of the store (table in the database).
   */
  _lastTranslator: function(sObjectStoreName) {
    var lTranslators = this._dTranslators[sObjectStoreName];
    if (!lTranslators) {
      throw "Unknown type."
    }
    var oTranslator = lTranslators[lTranslators.length - 1];
    return oTranslator;
  },

  empty : function(sObjectStoreName, mResultElementCallback){
     var self = this;

    this._oEngine.empty(sObjectStoreName, function(bIsEmpty){
       mResultElementCallback.call(self, bIsEmpty);
    });
  },

  // Must be called once the store is ready.
  iterList: function(sObjectStoreName, mResultElementCallback) {
    var self = this;

    this._oEngine.iterList(sObjectStoreName, function(oResult) {
      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  listInverse: function(sObjectStoreName, mResultElementCallback) {
    var self = this;

    this._oEngine.listInverse(sObjectStoreName, function(oResult) {
      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  getList: function(sObjectStoreName, mResultElementCallback){
    var self = this;

    this._oEngine.getList(sObjectStoreName, function(lResult) {
      var lList = new Array();
      var iLength = lResult.length;
      for (var i = 0; i < iLength; i++){
        var oDbRecord = lResult[i];
        var oTranslator = self._translatorForDbRecord(sObjectStoreName,
                                                      oDbRecord);
        var oObject = oTranslator.dbRecordToObject(oDbRecord);
        lList.push(oObject);
      }
      mResultElementCallback.call(self, lList);
    });
  },

  iterRange: function(sObjectStoreName, iLowerBound, iUpperBound,
                        mResultElementCallback) {
    var self = this;

    this._oEngine.iterRange(sObjectStoreName,
      iLowerBound, iUpperBound,
      function(oResult) {
      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  getRange: function(sObjectStoreName, iLowerBound, iUpperBound,
                      mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getRange(sObjectStoreName,
      iLowerBound, iUpperBound,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++) {
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName,
          oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
        }

        mResultElementCallback.call(self, lAllObjects);
    });
  },

  getKeyRange: function(sObjectStoreName, sIndexKey, iLowerBound, iUpperBound,
                      mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getKeyRange(sObjectStoreName, sIndexKey,
      iLowerBound, iUpperBound,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName,
          oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
        }

        mResultElementCallback.call(self, lAllObjects);
    });
  },

  getKeyRangeWithConstraint: function(sObjectStoreName, sIndexKey, iLowerBound, iUpperBound,
                      mResultElementCallback, mConstraint) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getKeyRangeWithConstraint(sObjectStoreName, sIndexKey,
      iLowerBound, iUpperBound,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName,
          oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
        }

        mResultElementCallback.call(self, lAllObjects);
    },
    mConstraint);
  },


  getListWithConstraint: function(sObjectStoreName, mResultElementCallback, mConstraint) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getListWithConstraint(sObjectStoreName, function(lResult) {
      if (!lResult) {
        // If there was no result, send back null.
        mResultElementCallback.call(self, lAllObjects);
        return;
      }
      // else lResult is a list of Items.
      var iLength = lResult.length;
      for (var i = 0; i < iLength; i++ ){
        var oItem = lResult[i];
        var oTranslator = self._translatorForDbRecord(sObjectStoreName,
        oItem);
        var oObject = oTranslator.dbRecordToObject(oItem);
        lAllObjects.push(oObject);
      }

      mResultElementCallback.call(self, lAllObjects);
    },
    mConstraint);
  },

  getUpperBound: function(sObjectStoreName, sIndexKey, iUpperBound,
                            iDirection, bStrict,
                            mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getUpperBound(
      sObjectStoreName, sIndexKey, iUpperBound, iDirection, bStrict,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
        }

        mResultElementCallback.call(self, lAllObjects);
    });
  },

  getLowerBound: function(sObjectStoreName, sIndexKey, iLowerBound,
                            iDirection, bStrict,
                            mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getLowerBound(
      sObjectStoreName, sIndexKey, iLowerBound, iDirection, bStrict,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);     }

        mResultElementCallback.call(self, lAllObjects);
    });
  },

  getBound: function(sObjectStoreName, sIndexKey,
                      iLowerBound, lUpperBound, iDirection,
                      bStrictLower, bStrictUpper,
                      mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getBound(
      sObjectStoreName, sIndexKey, iLowerBound, iUpperBound, iDirection,
      bStrictLower, bStrictUpper,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
        }

        mResultElementCallback.call(self, lAllObjects);
    });
  },

  getLastEntry: function(sObjectStoreName, mResultElementCallback) {
    var self = this;

    this._oEngine.getLastEntry(sObjectStoreName, function(oResult) {

      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  getLast: function(sObjectStoreName, sIndexKey, mResultElementCallback) {
    var self = this;

    this._oEngine.getLast(sObjectStoreName, sIndexKey, function(oResult) {

      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  getFirst: function(sObjectStoreName, sIndexKey, mResultElementCallback) {
    var self = this;

    this._oEngine.getFirst(sObjectStoreName, sIndexKey, function(oResult) {

      var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
      var oObject = oTranslator.dbRecordToObject(oResult);
      mResultElementCallback.call(self, oObject);
    });
  },

  getXItems: function(sObjectStoreName, iX, sIndexKey, iDirection,
      mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getXItems(
        sObjectStoreName, iX, sIndexKey, iDirection,
        function(lResult) {
          if (!lResult) {
            // If there was no result, send back null.
            mResultElementCallback.call(self, lAllObjects);
            return;
          }
          // else lResult is a list of Items.
          var iLength = lResult.length;
          for (var i = 0; i < iLength; i++ ){
            var oItem = lResult[i];
            var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
            var oObject = oTranslator.dbRecordToObject(oItem);
            lAllObjects.push(oObject);
          }

          mResultElementCallback.call(self, lAllObjects);
        });
  },

  getXItemsWithUpperBound: function(sObjectStoreName, iX, sIndexKey,
      iDirection, iLowerBound, bStrict, mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getXItemsWithUpperBound(
        sObjectStoreName, iX, sIndexKey, iDirection, iLowerBound, bStrict,
        function(lResult) {
          if (!lResult) {
            // If there was no result, send back null.
            mResultElementCallback.call(self, lAllObjects);
            return;
          }
          // else lResult is a list of Items.
          var iLength = lResult.length;
          for (var i = 0; i < iLength; i++ ){
            var oItem = lResult[i];
            var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
            var oObject = oTranslator.dbRecordToObject(oItem);
            lAllObjects.push(oObject);
          }

          mResultElementCallback.call(self, lAllObjects);
        });
  },

  getXItemsWithBound: function(sObjectStoreName, iX, sIndexKey,
      iDirection, iLowerBound, iUpperBound, bStrict, mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getXItemsWithBound(
        sObjectStoreName, iX, sIndexKey, iDirection, iLowerBound, iUpperBound, bStrict,
        function(lResult) {
          if (!lResult) {
            // If there was no result, send back null.
            mResultElementCallback.call(self, lAllObjects);
            return;
          }
          // else lResult is a list of Items.
          var iLength = lResult.length;
          for (var i = 0; i < iLength; i++ ){
            var oItem = lResult[i];
            var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
            var oObject = oTranslator.dbRecordToObject(oItem);
            lAllObjects.push(oObject);
          }

          mResultElementCallback.call(self, lAllObjects);
        });
  },

  getXYItems: function(sObjectStoreName, iX, iY, sIndexKey, iDirection,
      mResultElementCallback) {
    var self = this;

    var lAllObjects = new Array();
    this._oEngine.getXYItems(
        sObjectStoreName, iX, iY, sIndexKey, iDirection,
        function(lResult) {
          if (!lResult) {
            // If there was no result, send back null.
            mResultElementCallback.call(self, lAllObjects);
            return;
          }
          // else lResult is a list of Items.
          var iLength = lResult.length;
          for (var i = 0; i < iLength; i++ ){
            var oItem = lResult[i];
            var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
            var oObject = oTranslator.dbRecordToObject(oItem);
            lAllObjects.push(oObject);
          }

          mResultElementCallback.call(self, lAllObjects);
        });
  },

  find: function(sObjectStoreName, sIndexKey, oIndexValue,
                  mResultElementCallback) {
    var self = this;

    this._oEngine.find(sObjectStoreName, sIndexKey, oIndexValue,
      function(oResult) {
        if (!oResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, null, oIndexValue);
          return;
        }

        var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
        var oObject = oTranslator.dbRecordToObject(oResult);
        mResultElementCallback.call(self, oObject, oIndexValue);
    });
  },

  find_w: function(sObjectStoreName, sIndexKey, oIndexValue,
                  mResultElementCallback) {
    var self = this;

    this._oEngine.find_w(sObjectStoreName, sIndexKey, oIndexValue,
      function(oResult) {
        if (!oResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, null);
          return;
        }

        var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
        var oObject = oTranslator.dbRecordToObject(oResult);
        mResultElementCallback.call(self, oObject);
    });
  },

  findGroup: function(sObjectStoreName, sIndexKey, lIndexValue,
                        mResultElementCallback) {
    var self = this;
    var lAllObjects = new Array();

    this._oEngine.findGroup(sObjectStoreName, sIndexKey, lIndexValue,
      function(lResult) {
        if (!lResult) {
          // If there was no result, send back null.
          mResultElementCallback.call(self, lAllObjects);
          return;
        }
        // else lResult is a list of Items.
        var iLength = lResult.length;
        for (var i = 0; i < iLength; i++ ){
          var oItem = lResult[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName, oItem);
          var oObject = oTranslator.dbRecordToObject(oItem);
          lAllObjects.push(oObject);
      }

      mResultElementCallback.call(self, lAllObjects);
    });
  },

  search: function(sObjectStoreName, sIndexKey, oIndexValue,
                  mResultElementCallback) {
    var self = this;
    var lObjects = [];

    this._oEngine.search(sObjectStoreName, sIndexKey, oIndexValue,
      function(lResults) {
        var iLength = lResults.length
        for (var i = 0; i < iLength; i++) {
          var oResult = lResults[i];
          var oTranslator = self._translatorForDbRecord(sObjectStoreName, oResult);
          var oObject = oTranslator.dbRecordToObject(oResult);
          lObjects.push(oObject);
        }

        mResultElementCallback.call(self, lObjects, oIndexValue);
    });
  },

  // Must be called once the store is ready.
  put: function(sObjectStoreName, oObject, mOnSaveCallback) {
    var self = this;

    var oTranslator = this._translatorForObject(sObjectStoreName, oObject);
    var dDbRecord = oTranslator.objectToDbRecord(oObject);
    this._oEngine.put(sObjectStoreName, dDbRecord, function(iId) {

      if (mOnSaveCallback) {
        mOnSaveCallback.call(self, iId, oObject);
      }
    });
  },

  // Must be called once the store is ready.
  add: function(sObjectStoreName, oObject, mOnSaveCallback) {
    var self = this;

    var oTranslator = this._translatorForObject(sObjectStoreName, oObject);
    var dDbRecord = oTranslator.objectToDbRecord(oObject);
    this._oEngine.add(sObjectStoreName, dDbRecord, function(iId) {

      if (mOnSaveCallback) {
        mOnSaveCallback.call(self, iId, oObject);
      }
    });
  },


  putList: function(sObjectStoreName, lObjects, mOnSaveCallback) {
    var self = this;

    var lAllItems = new Array();
    var iLength = lObjects.length;
    for (var i = 0; i < iLength; i++) {
      var oObject = lObjects[i];
      var oTranslator = self._translatorForObject(sObjectStoreName, oObject);
      var dDbRecord = oTranslator.objectToDbRecord(oObject);
      lAllItems.push(dDbRecord);
    }

    this._oEngine.putList(sObjectStoreName, lAllItems, function(lAllId) {
      if (mOnSaveCallback) {
        mOnSaveCallback.call(self, lAllId);
      }
    });
  },

  putUnique: function(sObjectStoreName, oObject, mOnSaveCallback) {
    var oTranslator = this._translatorForObject(sObjectStoreName, oObject);
    var dDbRecord = oTranslator.objectToDbRecord(oObject);
    this._oEngine.putUnique(sObjectStoreName, dDbRecord,
        oTranslator.mergeDBRecords(), function(iId) {
      if (mOnSaveCallback) {
        mOnSaveCallback.call(self, iId);
      }
    });
  },

  delete: function(sObjectStoreName, iId, mOnDeleteCallback) {
    var self = this;

    this._oEngine.delete(sObjectStoreName, iId, function() {
      if (mOnDeleteCallback) {
        mOnDeleteCallback.call(self);
      }
    });
  },

  purge: function(sObjectStoreName, mResultElementCallback) {
    var self = this;

    this._oEngine.purge(sObjectStoreName, function() {
      mResultElementCallback.call(self);
    });
  },

});
