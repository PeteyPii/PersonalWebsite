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

app.directive('pwNoFocus', function() {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element) {
      element.bind('click', function(event) {
        element.blur();
      });
    },
  };
});
