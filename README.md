# Context Expression

Context expression template

## Usage

Install with npm:

```sh
$ npm install contextex --save
```

Script with contentex:

```
var explain = require('contextex');

var jackson = {name: "Jackson Tian", age: 18};

var str = 'I am ${@name}, I am ${@age} years old.';
var result = explain(str, context);

// => 'I am Jackson Tian, I am 18 years old.'
```

## License
The MIT license
