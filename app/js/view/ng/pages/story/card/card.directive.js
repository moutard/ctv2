/**
 *
 */

angular.module('cards', [])
.directive('ctCard', function() {

  return {
      restrict: 'E',
      template: require('./card.directive.html'),
      scope : {
        historyItem : '='
      },
      controller: controller
  };

  function controller ($scope) {
  }
});
require ('./types/default_card.directive.js');
