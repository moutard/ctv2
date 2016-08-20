/**
 *
 */
 var UrlParser = require ('utils/url_parser.js');
 require ('cotton');
 require ('core/chrome/index.js');


angular.module('cards')
.directive('ctDefaultCard', function() {
  return {
      restrict: 'E',
      template: require('./default_card.directive.html'),
      scope: {
        historyItem: '='
      },
      controller: controller
  };

  function controller ($scope) {
    var sUrl = $scope.historyItem.url();
    var oUrl = new UrlParser(sUrl);
    var oFavicon = new Cotton.Core.Favicon();

    $scope.domainName = oUrl.hostname;
    $scope.domainFavicon = oFavicon.getSrc() + sUrl;
  }

});
