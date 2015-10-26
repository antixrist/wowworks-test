/**
 * @author Maxim Vasiliev
 * @url https://github.com/maxatwork/jquery.deserialize
 * @url https://github.com/antixrist/jquery.deserialize
 */
(function ($) {

  var controlsSelectors = 'input:text, input[type="checkbox"], input[type="radio"], input[type="password"], textarea, select, input[type="hidden"]';

  $.is$ = function (obj) {
    return obj && obj.hasOwnProperty && obj instanceof jQuery;
  };

  var get$form = function (form) {
    var $form = null;
    var _form = $(form).get(0);

    if (_form && _form.tagName.toLowerCase() == 'form') {
      $form = _form;
    }

    return $form;
  };

  var get$controls = function (nodes) {
    var $controls = null;
    var $form = get$form(nodes);

    if ($form) {
      $controls = $(controlsSelectors, $form);
    } else {
      $controls = $(nodes).filter(controlsSelectors);
    }

    return $controls;
  };

  /**
   * Fills specified form with data extracted from string
   * @param elements form to fill
   * @param data URLencoded data
   * @param clearForm if true form will be cleared prior to deserialization
   */
  function deserialize (elements, data, clearForm) {
    var splits     = decodeURIComponent(data).split('&'),
        $controls  = get$controls(elements),
        i          = 0,
        split      = null,
        key        = null,
        value      = null,
        splitParts = null;

    if (clearForm) {
      $controls.filter([
        'input[type="checkbox"]',
        'input[type="radio"]'
      ].join(',')).removeAttr('checked');

      $controls.filter([
        'select',
        'textarea',
        'input[type="text"]',
        'input[type="password"]',
        'input[type="hidden"]'
      ].join(',')).val('');
    }

    var kv = {};
    while (split = splits[i++]) {
      splitParts = split.split('=');
      key        = splitParts[0] || '';
      value      = (
        splitParts[1] || ''
      ).replace(/\+/g, ' ');

      if (key != '') {
        if (key in kv) {
          if ($.type(kv[key]) !== 'array') {
            kv[key] = [kv[key]];
          }

          kv[key].push(value);
        } else {
          kv[key] = value;
        }
      }
    }

    for (key in kv) if (kv.hasOwnProperty(key)) {
      value = kv[key];

      $controls.filter([
        'input[type="checkbox"][name="'+ key +'"][value="'+ value +'"]',
        'input[type="radio"][name="'+ key +'"][value="'+ value +'"]'
      ].join(',')).prop('checked', true);

      $controls.filter([
        'select[name="'+ key +'"]',
        'input[type="text"][name="'+ key +'"]',
        'input[type="password"][name="'+ key +'"]',
        'input[type="hidden"][name="'+ key +'"]',
        'textarea[name="'+ key +'"]'
      ].join(',')).val(value);
    }
  }

  /**
   * jQuery.deserialize plugin
   * Fills elements in selected containers with data extracted from URLencoded string
   * @param data URLencoded data
   * @param clearForm if true form will be cleared prior to deserialization
   */
  $.fn.deserialize = function (data, clearForm) {
    deserialize(this, data, !!clearForm);
    return this;
  };

})(jQuery);
