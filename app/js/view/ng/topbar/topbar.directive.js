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


angular.module('topbar', [])
.directive('ctTopbar', function() {
    return {
        restrict: 'E',
        template: require ('./topbar.directive.html')
    };
});

require ('./more_options/more_options.directive.js');
