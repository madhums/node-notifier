
/**
 * Module dependencies.
 */

var postmark = require('postmark')
  , fs = require('fs')
  , path = require('path');


/**
 * Initialize notifier
 *
 * @api public
 */

var Notifier = exports = module.exports = function (config) {
  if (config) {
    this.config = config;

    if (config.email && !config.tplPath && !fs.exists(config.tplPath)) {
      throw new Error('Please provide correct path to the templates.');
    }
  }
}

/**
 * Notifier methods
 */

Notifier.prototype = {

  /**
   * Notifier config
   *
   * @param {Object} config
   * @api public
   */

  use: function (config) {
    var self = this;

    if (!config) return
    Object.keys(config).forEach(function (key) {
      self.config[key] = config[key];
    });
  },

  /**
   * Send the specified notification
   *
   * @param {String} action
   * @param {Object} notification
   * @api public
   */

  send: function (action, notification) {
    var config = this.config;

    if (this.config.actions.indexOf(action) === -1) {
      throw new Error('The action \'' + action + '\' is not specified');
    }

    // check if the object specified has all the required fields
    if (config.email) {
      var filePath = config.tplPath + '/' + action + '.jade';
      var exists = fs.existsSync(filePath);
      if (!exists) {
        throw new Error('Please specify a path to the template');
      }
    }

    // send apn
    if (config.APN) {
      this.APN(notification);
    }

    // send mails
    if (config.email) {
      this.mail(notification, filePath);
    }

    // send to facebook
    if (config.facebook) {
      this.postToFacebook(notification);
    }
  },

  /**
   * Process the template
   *
   * Note that this method can be overridden so that you can use your preffered
   * templating language. Default is jade
   *
   * @param {String} tplPath
   * @param {Object} locals
   * @return {String}
   * @api public
   */

  processTemplate: function (tplPath, locals) {
    var Jade = require('jade');

    var tpl = require('fs').readFileSync(tplPath, 'utf8');
    var html = Jade.compile(tpl, { filename: tplPath });

    return html(locals);
  },

  /**
   * Send email via postmark
   *
   * @param {Object} obj
   * @api public
   */

  mail: function (obj, filePath) {
    if(!/\@/.test(obj.to) || !/\@/.test(obj.from)) {
      throw new Error('Please specify proper to and from address');
    }

    var pm = {
      'From': obj.from,
      'To': obj.to,
      'Subject': obj.subject,
      'HtmlBody': this.processTemplate(filePath, obj.locals)
    };

    if (process.env.NODE_ENV === 'test') {
      console.log(pm);
    } else {
      postmark.send(pm);
    }
  },

  /**
   * Send Apple Push Notification
   *
   * @param {Object} obj
   * @api public
   */

  APN: function (obj) {
    // send apn
  },

  /**
   * Post to facebook
   *
   * @param {Object} obj
   * @api public
   */

  postToFacebook: function (obj) {
    // post to facebook
  }

}
