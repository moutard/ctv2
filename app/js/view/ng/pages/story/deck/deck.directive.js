angular.module('deck', [])
.directive('ctStoryDeck', function($q) {
    return {
        restrict: 'E',
        template: require('./deck.directive.html'),
        controller: controller,
        scope : {
          historyItems : '='
        }
    };

    function controller ($scope) {

    }
});
