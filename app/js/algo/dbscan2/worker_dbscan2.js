'use strict';
/**
 * DBSCAN2 Worker
 *
 * Workers are in charge of parallelize task.
 */

// Worker has no access to external librairies loaded in the main thread.
// Cotton.lib.
require ('underscore');
require ('lib/class.js');
require ('cotton');

// Cotton.utils.
require ('utils/url_parser.js');

// Cotton.config
require ('config/')

// Cotton.algo.
require ('algo/dbscan/');
require ('algo/dbscan2/find_closest_google_search_page.js')

/**
 * Loop through all the HistoryItems and compute their distances to each other.
 * Keys are HistoryItem ids. Values are lists of couples with distances
 * including the HistoryItem.
 */
function handleHistoryItem(lHistoryItems) {

  // PARAMETERS
  // Max Distance between neighborhood.
  var fEps = Cotton.Config.Parameters.dbscan2.fEps;
  // Min Points in a cluster
  var iMinPts = Cotton.Config.Parameters.dbscan2.iMinPts;

  var iNbCluster = Cotton.Algo.DBSCAN(lHistoryItems, fEps, iMinPts,
      Cotton.Algo.Score.DBRecord.HistoryItem);

  var dData = {};
  dData['iNbCluster'] = iNbCluster;
  dData['lHistoryItems'] = lHistoryItems;

  // self is defined by the worker api.
  // Send data to the main thread. Data are serialized.
  self.postMessage(dData);

  // Terminates the worker
  self.close();
}

/**
 * Connect worker with main thread. Worker starts when it receive
 * postMessage(). Data received are serialized. i.e. it's non
 * Cotton.Model.HistoryItem, but object.
 */
self.addEventListener('message', function(e) {
   handleHistoryItem(e.data['pool']);
}, false);
