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
  APN: false,
  facebook: true,
  mails: true,
  actions: ['comments', 'likes', 'wants', 'transactions']
})
```
The path to the template is the relative path. Also note that items in the actions are available as methods for the notifier.

```js
Notifier.comments({
  to: 'asd@asd.s',
  subject: 'ab ad a asd',
  from: 'asdas@sada',
  tplPath: 'path/to/template', // should be the path to the template
  locals: comment // should be the object containing the objects used in the templates
})
```
