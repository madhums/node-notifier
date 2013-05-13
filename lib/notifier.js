
/*!
 * node-nitifier
 * Copyright(c) 2013 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path');


/**
 * Initialize notifier
 *
 * @api public
 */

var Notifier = exports = module.exports = function (config) {
  if (config) {
    this.config = config;

    // Default template type
    // Helps when using ejs or any other templates
    if (!this.config.tplType) this.config.tplType = 'jade';

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
   * @return {Notifier}
   * @api public
   */

  use: function (config) {
    var self = this;

    if (!config) return
    Object.keys(config).forEach(function (key) {
      self.config[key] = config[key];
    });

    return this;
  },

  /**
   * Send the specified notification
   *
   * @param {String} action
   * @param {Object} notification
   * @param {Function} cb
   * @return {Notifier}
   * @api public
   */

  send: function (action, notification, cb) {
    var config = this.config;

    if (this.config.actions.indexOf(action) === -1) {
      throw new Error('The action \'' + action + '\' is not specified in notifier config');
    }

    // check if the object specified has all the required fields
    if (config.email) {
      var template = config.tplPath + '/' + action + '.' + config.tplType;
      var exists = fs.existsSync(template);
      if (!exists) {
        throw new Error('Please specify a path to the template');
      }
    }

    if (typeof cb !== 'function') cb = function () {};

    // send apn
    if (config.APN) {
      this.APN(notification, cb);
    }

    // send mails
    if (config.email) {
      this.mail(notification, template, cb);
    }

    return this;
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

  mail: function (obj, template, cb) {
    if (!this.config.postmarkKey) {
      throw new Error('Please provide the postmark key');
    }

    var postmark = require('postmark')(this.config.postmarkKey)

    if(!/\@/.test(obj.to) || !/\@/.test(obj.from)) {
      throw new Error('Please specify proper to and from address');
    }

    var pm = {
      'From': obj.from,
      'To': obj.to,
      'Subject': obj.subject,
      'HtmlBody': this.processTemplate(template, obj.locals)
    };

    // as you don't want to send emails while development or testing
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      console.log(pm);
      cb();
      return pm;
    } else {
      postmark.send(pm, cb);
    }
  },

  /**
   * Send Apple Push Notification
   *
   * @param {Object} obj
   * @api public
   */

  APN: function (obj, cb) {
    if (!this.config.parseAppId || !this.config.parseApiKey) {
      throw new Error('Please specify parse app id and app key');
    }

    if (!this.config.parseChannels) {
      throw new Error('Please specify the parse channels.');
    }

    if (!Array.isArray(this.config.parseChannels)) {
      throw new Error('Channels should be an array');
    }

    var Parse = require('node-parse-api').Parse;
    var app = new Parse(this.config.parseAppId, this.config.parseApiKey);
    var notification = {
      channels: this.config.parseChannels,
      data: {
        alert: obj.alert || obj.subject,
        route: obj.route
      }
    };

    app.sendPush(notification, cb);
  },
}
