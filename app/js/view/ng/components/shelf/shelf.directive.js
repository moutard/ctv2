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
        templateUrl: 'js/view/ng/components/shelf/shelf.directive.html'
    };
});
