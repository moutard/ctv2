// Handles routes and routes configuration
angular.module('appRouting', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider) {

  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/home");

  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/home",
      template: require("./pages/home/home.view.html"),
      controller: 'HomeController'
    })
    .state('settings', {
      url: "/settings",
      template: require("./pages/settings/settings.view.html"),
      controller: 'SettingsController'
    })
    .state('curator', {
      url: "/curator",
      template: require("./pages/curator/curator.view.html"),
      controller: 'CuratorController'
    })
    .state('story', {
      url: "/story?sid",
      template: require("./pages/story/story.view.html"),
      controller: 'StoryController',
      params: {
        // story id.
        sid: null
      }
    })
    .state('search', {
      url: "/search?q",
      template: require("./pages/search/search.view.html"),
      controller: 'SearchController',
      params: {
        // query to search for.
        q: null
      }
    });
});
