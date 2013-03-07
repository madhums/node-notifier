## Notifier

A simple node.js module to handle all the application level notifications (apple push notifications, mails and facebook posts)

## Installation

```sh
$ npm install notifier
```

or include it in `package.json`

## Usage

*Note* : Work in progress, do not use it yet

```js
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
```

## Tests

Replace the keys in `test/test.js`

```sh
$ npm test
```
