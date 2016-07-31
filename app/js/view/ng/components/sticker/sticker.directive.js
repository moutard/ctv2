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
angular.module('sticker', [])
.directive('ctSticker', function() {
    return {
        restrict: 'E',
        template: require('./sticker.directive.html')
    };
});