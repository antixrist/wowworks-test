(function (window, document, $, undefined) {$(function () {

  //var $form = $('form[data-grid-filters]');
  //var controlsSelectors = 'input:text, input[type="checkbox"], input[type="radio"], input[type="password"], textarea, select, input[type="hidden"]';
  //
  //var $inputs = $(controlsSelectors, $form);
  //$form.on('change', controlsSelectors, function (e) {
  //  var $control = $(this);
  //
  //  var serializedObject = $inputs.serializeObject();
  //  var serializedObjectStr = $inputs.serializeObject({hash: false});
  //
  //  console.log('serializedObject:', serializedObject);
  //  console.log('reverse:', $.param(serializedObject));
  //  console.log('serializedObjectStr:', serializedObjectStr);
  //  console.log('reverse == serializedObjectStr:', $.param(serializedObject) == serializedObjectStr);
  //});


  var makeCharts = function () {};
  if ($.pluginsExists('peity')) {
    $.fn.peity.defaults.line = {
      delimiter: ',',
      fill: 'transparent',
      height: 16,
      max: null,
      min: 0,
      stroke: '#ff6633',
      strokeWidth: 2,
      width: 32
    };

    makeCharts = function (selector, $scope) {
      if (!$scope || !$scope.length) {
        $scope = document;
      }

      //$('span.pie').peity('pie');
      //$('.donut').peity('donut');
      //$('.line:not(.updating-chart)').peity('line');
      //$('.bar').peity('bar');

      var $updatingChart = $('.line', $scope).peity('line', {width: 60, height: 10});


      setInterval(function () {
        $updatingChart.each(function (index, node) {
          var $node = $(node);
          var random = Math.round(Math.random() * 10);
          var values = $node.text().split(",");
          values.shift();
          values.push(random);

          $node
              .text(values.join(','))
              .change();
        });
      }, 1000);
    };
  }

  $.pluginsExists('tabler', function () {
    $('[data-grid]').tabler({
      url: '/api/finance.json',

      loadDataOnInit: true,

      selectors: {
        titles: '[data-grid-titles]',
        rows: '[data-grid-rows]',
        filters: '[data-grid-filter]',
      },


    });
  });


});})(window, document, jQuery);