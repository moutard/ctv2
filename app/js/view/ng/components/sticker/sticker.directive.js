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
 require('../sticker-image/sticker-image.directive.js');

angular.module('sticker', ['stickerImage'])
.directive('ctSticker', function($state) {
    return {
        restrict: 'E',
        template: require('./sticker.directive.html'),
        scope: {
          story: '='
        },
        controller: controller
    };

    function controller ($scope) {
      $scope.openStory = function (storyId) {
        $state.go('story', {'sid': storyId});
      };
    }


});
