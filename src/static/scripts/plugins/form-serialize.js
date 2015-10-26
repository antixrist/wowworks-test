/**
 *
 * @url https://github.com/defunctzombie/form-serialize
 * @url https://github.com/antixrist/form-serialize
 */

(function (window, document, $, undefined) {

  if (!Array.isArray) {
    /**
     * @param {*} raw
     * @returns {boolean}
     */
    _.isArray = function (raw) {
      return Object.prototype.toString.call(raw) === '[object Array]';
    };
  }

  // get successful control from form and assemble into object
  // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

  // types which indicate a submit action and are not successful controls
  // these will be ignored
  var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

  // node names which could be successful controls
  var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

  // Matches bracket notation.
  var brackets = /(\[[^\[\]]*\])/g;

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


  // serializes form fields
  // @param elements HTML elements or HTMLForm
  // @param options is an optional argument to configure the serialization. Default output
  // with no options specified is a url encoded string
  //    - hash: [true | false] Configure the output type. If true, the output will
  //    be a js object.
  //    - serializer: [function] Optional serializer function to override the default one.
  //    The function takes 3 arguments (result, key, value) and should return new result
  //    hash and url encoded str serializers are provided with this module
  //    - disabled: [true | false]. If true serialize disabled fields.
  //    - empty: [true | false]. If true serialize empty fields
  var serialize = function (nodes, options) {
    if (typeof options != 'object') {
      options = {hash: !!options};
    } else if (options.hash === undefined) {
      options.hash = true;
    }

    var result     = (options.hash) ? {} : '';
    var serializer = options.serializer || ((options.hash) ? hashSerializer : strSerialize);

    //Object store each radio and set if it's empty or not
    var radio_store = Object.create(null);

    nodes = get$controls(nodes).get();

    var node, key, val, selectOptions, isSelectedOptions, option, allowedEmpty, hasValue;
    for (var i = 0; i < nodes.length; ++i) {
      node = nodes[i];

      // ingore disabled fields
      if ((!options.disabled && node.disabled) || !node.name) {
        continue;
      }
      // ignore anyhting that is not considered a success field
      if (!k_r_success_contrls.test(node.nodeName) ||
        k_r_submitter.test(node.type)) {
        continue;
      }

      key = node.name;
      val = node.value;

      // we can't just use node.value for checkboxes cause some browsers lie to us
      // they say "on" for value when the box isn't checked
      if ((node.type === 'checkbox' || node.type === 'radio') && !node.checked) {
        val = undefined;
      }

      // If we want empty nodes
      if (options.empty) {
        // for checkbox
        if (node.type === 'checkbox' && !node.checked) {
          val = '';
        }

        // for radio
        if (node.type === 'radio') {
          if (!radio_store[node.name] && !node.checked) {
            radio_store[node.name] = false;
          } else if (node.checked) {
            radio_store[node.name] = true;
          }
        }

        // if options empty is true, continue only if its radio
        if (!val && node.type == 'radio') {
          continue;
        }
      } else
      // value-less fields are ignored unless options.empty is true
      if (!val) {
        continue;
      }

      // multi select boxes
      if (node.type === 'select-multiple') {
        val = [];

        selectOptions     = node.options;
        isSelectedOptions = false;
        for (var j = 0; j < selectOptions.length; ++j) {
          option       = selectOptions[j];
          allowedEmpty = options.empty && !option.value;
          hasValue     = (option.value || allowedEmpty);
          if (option.selected && hasValue) {
            isSelectedOptions = true;

            // If using a hash serializer be sure to add the
            // correct notation for an array in the multi-select
            // context. Here the name attribute on the select node
            // might be missing the trailing bracket pair. Both names
            // "foo" and "foo[]" should be arrays.
            if (options.hash && key.slice(key.length - 2) !== '[]') {
              result = serializer(result, key + '[]', option.value);
            } else {
              result = serializer(result, key, option.value);
            }
          }
        }

        // Serialize if no selected options and options.empty is true
        if (!isSelectedOptions && options.empty) {
          result = serializer(result, key, '');
        }

        continue;
      }

      result = serializer(result, key, val);
    }

    // Check for all empty radio buttons and serialize them with key=""
    if (options.empty) {
      for (var k in radio_store) {
        if (radio_store.hasOwnProperty(k)) {
          if (!radio_store[k]) {
            result = serializer(result, k, '');
          }
        }
      }
    }

    return result;
  };

  var parseKeys = function (string) {
    var keys     = [];
    var prefix   = /^([^\[\]]*)/;
    var children = new RegExp(brackets);
    var match    = prefix.exec(string);

    if (match[1]) {
      keys.push(match[1]);
    }

    while ((match = children.exec(string)) !== null) {
      keys.push(match[1]);
    }

    return keys;
  };

  var hashAssign = function (result, keys, value) {
    if (keys.length === 0) {
      result = value;
      return result;
    }

    var key     = keys.shift();
    var between = key.match(/^\[(.+?)\]$/);

    if (key === '[]') {
      result = result || [];

      if (Array.isArray(result)) {
        result.push(hashAssign(null, keys, value));
      }
      else {
        // This might be the result of bad name attributes like "[][foo]",
        // in this case the original `result` object will already be
        // assigned to an object literal. Rather than coerce the object to
        // an array, or cause an exception the attribute "_values" is
        // assigned as an array.
        result._values = result._values || [];
        result._values.push(hashAssign(null, keys, value));
      }

      return result;
    }

    // Key is an attribute name and can be assigned directly.
    if (!between) {
      result[key] = hashAssign(result[key], keys, value);
    }
    else {
      var string = between[1];
      var index  = parseInt(string, 10);

      // If the characters between the brackets is not a number it is an
      // attribute name and can be assigned directly.
      if (isNaN(index)) {
        result         = result || {};
        result[string] = hashAssign(result[string], keys, value);
      }
      else {
        result        = result || [];
        result[index] = hashAssign(result[index], keys, value);
      }
    }

    return result;
  };

  // Object/hash encoding serializer.
  var hashSerializer = function (result, key, value) {
    var matches = key.match(brackets);

    // Has brackets? Use the recursive assignment function to walk the keys,
    // construct any missing objects in the result tree and make the assignment
    // at the end of the chain.
    if (matches) {
      var keys = parseKeys(key);
      hashAssign(result, keys, value);
    } else {
      // Non bracket notation can make assignments directly.
      var existing = result[key];

      // If the value has been assigned already (for instance when a radio and
      // a checkbox have the same name attribute) convert the previous value
      // into an array before pushing into it.
      //
      // NOTE: If this requirement were removed all hash creation and
      // assignment could go through `hashAssign`.
      if (existing) {
        if (!Array.isArray(existing)) {
          result[key] = [existing];
        }

        result[key].push(value);
      }
      else {
        result[key] = value;
      }
    }

    return result;
  };

  // urlform encoding serializer
  var strSerialize = function (result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value);

    // spaces should be '+' rather than '%20'.
    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
  };

  /**
   * @param {{}} [options]
   * @this {jQuery}
   * @returns {*}
   */
  $.fn.serializeObject = function (options) {
    options = $.isPlainObject(options) ? options : {};

    return serialize(this, options);
  };

})(window, document, jQuery);

