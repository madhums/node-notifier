/*!
 * node-notifier
 * Copyright(c) 2014 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , parallel = require('lll');

/**
 * Initialize notifier
 *
 * @api public
 */

var Notifier = function (config) {
  if (config) {
    this.config = config;

    if (!this.config.service || (this.config.service != 'sendgrid' && this.config.service != 'postmark')) {
      throw new Error('Please specify which service you want to use - sendgrid or postmark');
    }

    this.config.service = this.config.service.toLowerCase();

    // Default template type
    // Helps when using ejs or any other templates
    if (!this.config.tplType) this.config.tplType = 'jade';

    if (config.email && !config.tplPath && !fs.exists(config.tplPath)) {
      throw new Error('Please provide correct path to the templates.');
    }
  }
}

/**
 * Expose
 */

module.exports = Notifier;

/**
 * Notifier config
 *
 * @param {Object} config
 * @return {Notifier}
 * @api public
 */

Notifier.prototype.use = function (config) {
  var self = this;

  if (!config) return
  Object.keys(config).forEach(function (key) {
    self.config[key] = config[key];
  });

  return this;
};

/**
 * Send the specified notification
 *
 * @param {String} action
 * @param {Object} notification
 * @param {Function} cb
 * @return {Notifier}
 * @api public
 */

Notifier.prototype.send = function (action, notification, cb) {
  var config = this.config;
  var self = this;
  var args = [];

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
    args.push(function (fn) {
      self.APN(notification, fn);
    });
  }

  // send mails
  if (config.email) {
    args.push(function (fn) {
      self.mail(notification, template, fn);
    });
  }

  // Execute the callback only once
  // Make sure the mail and APN are sent in parallel
  parallel(args, cb);

  return this;
};

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

Notifier.prototype.processTemplate = function (tplPath, locals) {
  var Jade = require('jade');

  var tpl = require('fs').readFileSync(tplPath, 'utf8');
  var html = Jade.compile(tpl, { filename: tplPath });

  return html(locals);
};

/**
 * Send email via postmark
 *
 * @param {Object} obj
 * @api public
 */

Notifier.prototype.mail = function (obj, template, cb) {
  var options
  var html = this.processTemplate(template, obj.locals)

  if (!this.config.key) {
    throw new Error('Please provide the service key');
  }

  if(!/\@/.test(obj.to) || !/\@/.test(obj.from)) {
    throw new Error('Please specify proper to and from address');
  }

  if (this.config.service === 'postmark') {
    var postmark = require('postmark')(this.config.key)
    options = {
      'From': obj.from,
      'To': obj.to,
      'Subject': obj.subject,
      'HtmlBody': html
    };
  } else if (this.config.service === 'sendgrid') {
    var SendGrid = require('sendgrid').SendGrid;
    var sendgrid = new SendGrid(this.config.sendgridUser, this.config.key);
    options = {
      'to': obj.to,
      'from': obj.from,
      'subject': obj.subject,
      'html': html
    };
  }

  // as you don't want to send emails while development or testing
  if (process.env.NODE_ENV === 'test'
    || process.env.NODE_ENV === 'development') {
    // don't log during tests
    if (process.env.NODE_ENV !== 'test') {
      console.log(options);
    }
    cb();
    return options;
  } else {
    if (this.config.service === 'sendgrid')
      sendgrid.send(options, cb)
    else
      postmark.send(options, cb)
  }
};

/**
 * Send Apple Push Notification
 *
 * @param {Object} obj
 * @api public
 */

Notifier.prototype.APN = function (obj, cb) {
  if (!this.config.parse && this.config.parseAppId && this.config.parseApiKey) {
    // use parseApiKey as master_key because older versions of notifier were based on master_key!
    this.config.parse = {
      app_id: this.config.parseAppId,
      master_key: this.config.parseApiKey
    }
  }

  if (!this.config.parse.app_id || !(this.config.parse.api_key || this.config.parse.master_key)) {
    throw new Error('Please specify parse app id and api key / master key');
  }

  var channels = obj.parseChannels || this.config.parseChannels;

  if (!channels) {
    throw new Error('Please specify the parse channels.');
  }

  if (!Array.isArray(channels)) {
    throw new Error('Channels should be an array');
  }

  var Parse = require('node-parse-api').Parse;
  var app = new Parse(this.config.parse)
  var notification = {
    channels: channels,
    data: {
      alert: obj.alert || obj.subject,
      route: obj.route
    }
  };
  if (obj.badge !== undefined) {
    notification.data.badge = obj.badge
  }
  app.sendPush(notification, cb);
};
