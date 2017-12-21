# Context Expression

Context expression template

## Badges

- [![Build Status](https://travis-ci.org/JacksonTian/context-ex.svg?branch=refine)](https://travis-ci.org/JacksonTian/context-ex)

- [![Coverage Status](https://coveralls.io/repos/github/JacksonTian/context-ex/badge.svg?branch=master)](https://coveralls.io/github/JacksonTian/context-ex?branch=master)

## Usage

Install with npm:

```sh
$ npm install contextex --save
```

Script with contentex:

```js
const explain = require('contextex');

const jackson = {name: "Jackson Tian", age: 18};

const str = 'I am ${@name}, I am ${@age} years old.';
const result = explain(str, context);

console.log(result);
// => 'I am Jackson Tian, I am 18 years old.'
```

## License
The MIT license
