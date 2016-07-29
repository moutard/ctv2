/**
 * @ngdoc directive
 * @name topbar.directive:ctTopbar
 * @scope
 * @restrict E
 *
 * @description
 * Displays a small topbar bellow the header that contains a given message.
 * The topbar can be green if it's a success message or red if it's an error.
 *
 * @param {string} message text you want to display.
 * @param {Boolean} isSuccess true if it's a success message.
 */
angular.module('topbar', [])
.directive('ctTopbar', function() {
    return {
        restrict: 'E',
        templateUrl: 'js/view/ng/topbar/topbar.directive.html'
    };
});
