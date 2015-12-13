app.directive('ngAlt', function() {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attrs) {
      attrs.$observe('ngAlt', function(value) {
        attrs.$set('alt', value);
      });
    },
  };
});
