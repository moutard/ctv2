/**
 *
 */
angular.module('stickerImage', [])
.directive('ctStickerImage', function() {
    return {
        restrict: 'E',
        template: require('./sticker-image.directive.html'),
        controller: controller,
        scope: {
           imageUrl: "@"
       },
    };

    function controller ($scope) {
        var $img = $('<img class="ct-resize" src="' + $scope.imageUrl + '"></img>');
        resize($img);
    }

  /**
   * Resize the image so it fits perfectly in the container.
   * @param {DOM} $img:
   *          dom img element you want to resize.
   */
  function resize($img) {
    $img.on('load', function(){

      //image size and ratio
      var iImWidth = $img.width();
      var iImHeight = $img.height();
      var fImRatio = iImWidth/iImHeight;

      //div size and ratio
      var iDivWidth = $img.parent().width();
      var iDivHeight = $img.parent().height();
      var fDivRatio = iDivWidth/iDivHeight;

      //center image according on how it overflows
      //if vertical, keep the upper part more visible
      if (fImRatio > fDivRatio) {
        $img.css('height',iDivHeight);
        var iOverflow = $img.width()-iDivWidth;
        $img.css('left',-iOverflow*0.5);
      } else {
        $img.css('width',iDivWidth);
        var iOverflow = $img.height()-iDivHeight;
        $img.css('top',-iOverflow*0.25);
      }
      $img.addClass('show');
      $(this).unbind('load');
    });
  }
})
.directive('imageonload', function() {
      return {
          restrict: 'A',
          link: function(scope, element, attrs) {
              element.bind('load', function() {
                  //call the function that was passed
                  //image size and ratio
                  var iImWidth = element.width();
                  var iImHeight = element.height();
                  var fImRatio = iImWidth/iImHeight;

                  //div size and ratio
                  var iDivWidth = element.parent().width();
                  var iDivHeight = element.parent().height();
                  var fDivRatio = iDivWidth/iDivHeight;

                  // Center image according on how it overflows
                  // if vertical, keep the upper part more visible
                  if (fImRatio > fDivRatio) {
                    element.css('height',iDivHeight);
                    var iOverflow = element.width()-iDivWidth;
                    element.css('left',-iOverflow*0.5);
                  } else {
                    element.css('width',iDivWidth);
                    var iOverflow = element.height()-iDivHeight;
                    element.css('top',-iOverflow*0.25);
                  }
                  element.addClass('show');
              });
          }
      };
  });
