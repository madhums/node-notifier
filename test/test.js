
var Notifier = require('../');

exports.testNotifier = function (test) {
  var notifier = new Notifier({
    APN: false,
    facebook: true,
    email: true,
    actions: ['comment', 'like'],
    tplPath: require('path').resolve(__dirname, './templates'),
    postmarkKey: 'xxx'
  });

  var comment = {
    to: 'Tom',
    from: 'Harry'
  };

  notifier.send('comment', {
    to: 'tom@madhums.me',
    subject: 'Harry says Hi to you',
    from: 'harry@madhums.me',
    locals: comment // should be the object containing the objects used in the templates
  });

  test.expect(1);
  test.ok(true, "this assertion should pass");
  test.done();
}
