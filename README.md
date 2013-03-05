## Notifier

A simple node.js module to handle all the application level notifications

## Installation

```sh
$ npm install notifier
```

or include it in `package.json`

## Usage

** Note ** : Work in progress, do not use it yet

```js
var Notifier = require('notifier')

Notiier.config({
  templates: 'path/to/templates',
  APN: false,
  facebook: true,
  mails: true,
  actions: ['comments', 'likes', 'wants', 'transactions']
})
```

Note that items in the actions are available as methods for the notifier.

```js
Notifier.comments({
  to: 'asd@asd.s',
  subject: 'ab ad a asd',
  from: 'asdas@sada',
  body: 'path/to/template', // should be the path to the template
  object: comment // should be the object containing the objects used in the templates
})
```
