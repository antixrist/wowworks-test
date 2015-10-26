/**
 * @author antixrist
 * @url https://github.com/antixrist/jquery.plugins-exists.js
 */
(typeof jQuery != 'undefined') && (function (window, document, $, undefined) {
  var _ = {};

  if (Array.isArray) {
    _.isArray = Array.isArray;
  } else {
    /**
     * @param {*} raw
     * @returns {boolean}
     */
    _.isArray = function (raw) {
      return Object.prototype.toString.call(raw) === '[object Array]';
    };
  }

  /**
   * @param {*} raw
   * @returns {[]}
   */
  _.toArray = function (raw) {
    if (!raw) {
      return [];
    }
    return Array.prototype.slice.call(raw, 0);
  };

  /**
   * @param {string|string[]|string...} pluginName
   * @param {Function} [cb]
   */
  var jqPluginsExists = function (pluginName, cb) {
    var args = _.toArray(arguments);
    var pluginNames;

    if (typeof args[args.length-1] == 'function') {
      cb = args.pop();
    } else {
      cb = function () {};
    }
    pluginNames = args;

    var exists = jqPluginsExists.checkPlugins(pluginNames);

    exists && cb();

    return exists;
  };

  /**
   * @param {(string|[])[]} pluginNames
   * @returns {boolean}
   */
  jqPluginsExists.checkPlugins = function (pluginNames) {
    var exists = true;
    var pluginName;

    if (!_.isArray(pluginNames)) {
      pluginNames = _.toArray(pluginNames);
    }

    for (var i = 0, length = pluginNames.length; i < length; i++) {
      pluginName = pluginNames[i];
      if (_.isArray(pluginName)) {
        exists = jqPluginsExists.checkPlugins(pluginName);
      } else {
        exists = jqPluginsExists.checkPlugin(pluginName);
      }

      if (!exists) { break; }
    }

    return exists;
  };

  jqPluginsExists.checkPlugin = function (pluginName) {
    pluginName = pluginName.toString() || '';
    return pluginName && (typeof $.fn[pluginName] != 'undefined' || typeof $[pluginName] != 'undefined');
  };

  window.jqPluginsExists = $.pluginsExists = jqPluginsExists;

})(window, document, jQuery);

(typeof jQuery == 'undefined') && console && typeof console.error != 'undefined' && console.error('[$.pluginsExists] jQuery is undefined!');