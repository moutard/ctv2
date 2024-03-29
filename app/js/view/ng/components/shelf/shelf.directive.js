/**
 * @ngdoc directive
 * @name topbar.directive:ctTopbar
 * @scope
 * @restrict E
 *
 * @description
 * Displays the topbar that contains the logo, navigation arrows, search and hamburger menu.
 *
 */
angular.module('shelf', [])
.directive('ctShelf', function() {
    return {
        restrict: 'E',
        template: require('./shelf.directive.html'),
        controller: controller,
        scope: {
          shelf: '='
        }
    };

    function controller ($scope) {
      $scope.shelfTitle = $scope.shelf.title;
      $scope.stories = $scope.shelf.stories;
    }
});
