require ('./deck/deck.directive.js');

angular.module('story', ['storyService', 'deck'])
.controller('StoryController', function($scope, $state, $q, $stateParams, storyService) {

    // Story Id.
    $scope.storyId = parseInt($stateParams.sid);

    storyService.getStoriesById($scope.storyId).then(function (oStory) {
      $scope.story = oStory;
    });

});
