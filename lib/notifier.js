
/**
 * Module dependencies.
 */

var postmark = require('postmark')
  , fs = require('fs');

/**
 * Initialize notifier with config
 *
 * @param {Object} config
 * @return {Notifier}
 * @api public
 */

function Notifier (config) {
  var self = this;

  if (!config) {
    throw new Error('Please provide a config file.');
    return;
  }

  if (config && !config.templates) {
    throw new Error('Please provide the path to templates.');
  }

  var actions = config.actions;
  if (actions) {
    actions.forEach(function (action) {
      self[action] = function (options) {
        if (config.APN) {
          // send apn
          self.APN(options);
        }

        if (config.mails) {
          // send mails
          self.mail(options)
        }

        if (config.facebook) {
          // send to facebook
          self.postToFacebook(options);
        }
      };
    });
  }
}

module.exports = Notifier;

Notifier.prototype = {

  /**
   * Mailer
   *
   * @param {Object} options
   * @api public
   */

  mail: function (options) {
    var submit = function(to) {
      var subject = mail.subject;

      var pm = {
        'From': options.from,
        'To': options.to,
        'Subject': options.subject,
        'HtmlBody': processTemplate(options.tplPath, options.locals)
      };

      // send emails only if emailing is enabled
      if (config.email) {
        postmark.send(pm);
      } else {
        if (env !== 'test') console.log(pm);
      }
    }

    if(/\@/.test(mail.to)) {
      return submit(mail.to);
    }
  },

  /**
   * Process the template
   *
   * @param {String} path
   * @param {Object} locals
   * @api public
   */

  processTemplate: function (tplPath, locals) {
    var Jade = require('jade')

    tplPath = tplPath + '.jade';

    var tpl = require('fs').readFileSync(tplPath, 'utf8');
    var html = Jade.compile(tpl, { filename: tplPath });

    return html(locals);
  },

  /**
   * Sends Apple Push Notification
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
