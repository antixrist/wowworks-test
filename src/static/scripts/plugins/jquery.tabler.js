;(function (window, document, $, undefined) {

  //var serialized = $form.serialize();
  //var serializedObject = $form.serializeObject();
  //
  //console.log('serialized:', serialized);
  //console.log('reverse:', $.deparam(serialized));
  //console.log('serializedObject:', serializedObject);
  //console.log('reverse:', $.param(serializedObject));

  var pluginName = 'tabler';
  var getEvent = function (eventName) {
    return [eventName.toString(), pluginName].join('.');
  };

  var defaults = {
    url: '',

    loadDataOnInit: false,

    selectors: {
      titles: '[data-grid-titles]',
      rows: '[data-grid-rows]',
      filters: '[data-grid-filter]',
    },

    /** @return {Function} $.Deferred() */
    loadData: function () {
      var defer = $.Deferred();

      return defer;
    },
    beforeInsertData: function () {

    },
    afterInsertData: function () {

    },
    getItemHTML: function (data) {

    },
    getFilters: function () {

    },
    getOrders: function () {

    },
  };

  var Plugin = function (element, options) {
    this.el = element;
    this.$el = $(element);
    this.options = $.extend(true, {}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  };

  $.extend(Plugin.prototype, {
    $: function (selector) {
      return $(selector, this.$el);
    },

    init: function () {
      if (!$.pluginsExists('deparam', 'deserialize'/*, 'debounce'*/)) {
        console && console.error([
          '[jQuery.tabler]',
          'Next plugins is required:',
          '- deparam [ https://github.com/AceMetrix/jquery-deparam ]',
          '- serialize [ https://github.com/antixrist/form-serialize ]',
          '- deserialize [ https://github.com/antixrist/jquery.deserialize ]',
          //'- throttle/debounce [ http://github.com/cowboy/jquery-throttle-debounce ]'
        ].join('\n'));
        return;
      }

      if (!this.options.url) {
        console && console.error([
          '[jQuery.tabler]',
          '"url" option is required!'
        ].join('\n'));
        return;
      }

      this.setElements();
      this.bindEvents();

      var queryStringData = this.getQueryStringData();
      this._setFormValues(this.$filters, this.getQueryStringData(), true);
      !!this.options.loadDataOnInit && this.loadData(queryStringData).then(this.render);
    },

    setElements: function () {
      this.$titles = this.$(this.options.selectors.titles);
      this.$rows = this.$(this.options.selectors.rows);
      this.$filters = this.$(this.options.selectors.filters);
    },

    updateQueryString: function () {
      this.setQueryStringData(this._getFormValues(this.$filters));
    },

    bindEvents: function () {
      var self = this;
      var isTriggerStateChange = false;

      var selectorsForKeyup = 'input:text, input[type="password"], textarea, input[type="hidden"]';
      var controlsSelectors = 'input:text, input[type="checkbox"], input[type="radio"], input[type="password"], textarea, select, input[type="hidden"]';

      this.$el.on(getEvent('change'), controlsSelectors, function (e) {
        isTriggerStateChange = true;
        self.updateQueryString();
      });

      this.$el.on(getEvent('keyup'), selectorsForKeyup, $.debounce(200, function (e) {
        isTriggerStateChange = true;
        self.updateQueryString();
      }));

      History.Adapter.bind(window, 'statechange', function () {
        var queryStringData = self.getQueryStringData();
        if (!isTriggerStateChange) {
          self._setFormValues(self.$filters, self.getQueryStringData(), true);
        }
        isTriggerStateChange = false;
        self.loadData(queryStringData).then(self.render);
      });
    },

    loadData: function (options) {
      var self = this;
      this.jqXHR = null;

      self.loaderShow();

      if (this.jqXHR && this.jqXHR.state() === 'pending') {
        this.jqXHR.abort();
      }

      var ajaxOptions = $.extend({
        dataType: 'json'
      }, options || {}, {url: this.options.url});

      var defer = $.Deferred();
      this.jqXHR = $.ajax(ajaxOptions).done(function (data, responseStatus, jqXHR) {
        if (responseStatus != 'success') {
          defer.reject();
        } else {
          defer.resolve(data);
        }
      }).always(function () {
        self.loaderHide();
      });

      return defer.promise();
    },

    render: function (data) {
      console.log('render!', data);
    },

    setQueryStringData: function (data, title) {
      title = title || document.title;
      var dataUri = '';

      if (!$.isPlainObject(data)) {
        if (typeof data != 'string') {
          data = data.toString();
        }
        dataUri += data;
        data = $.deparam(data);
      } else {
        dataUri += $.param(data);
      }

      dataUri = '?'+ dataUri;

      History.pushState(data, title, dataUri);
    },

    loaderShow: function () {
      console.log('loading...');
    },

    loaderHide: function () {
      console.log('loading stopped!');
    },

    getQueryStringData: function () {
      return History.getState().data;
    },

    _getFormValues: function ($form, options) {
      options = typeof options != 'undefined' ? options : {};
      return $form.serializeObject(options);
    },

    _setFormValues: function ($form, data, clearForm) {
      if ($.isPlainObject(data)) {
        data = $.param(data);
      } else if (typeof data != 'string') {
        data = data.toString();
      }

      $form.deserialize(data, !!clearForm);
    },

  });

  $.fn[pluginName] = function (options) {
    this.each(function () {
      if (!$.data(this, 'plugin_'+ pluginName)) {
        $.data(this, 'plugin_'+ pluginName, new Plugin(this, options));
      }
    });

    return this;
  };

})(window, document, jQuery);