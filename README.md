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
var notifier = new Notifier();

notifier.use({
  APN: false,
  facebook: true,
  email: true,
  actions: ['comment', 'like'],
  tplPath: require('path').resolve(__dirname, './templates')
});

var comment = {
  to: 'Tom',
  from: 'Harry'
}

notifier.send('comment', {
  to: 'to@madhums.me',
  subject: 'ab ad a asd',
  from: 'harry@madhums.me',
  locals: comment // should be the object containing the objects used in the templates
});
```

## Tests

```sh
$ npm test
```
