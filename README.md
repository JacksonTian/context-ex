# Context Expression

Context expression template

## Usage

Install with npm:

```sh
$ npm install contextex --save
```

Script with contentex:

```
const explain = require('contextex');

const jackson = {name: "Jackson Tian", age: 18};

const str = 'I am ${@name}, I am ${@age} years old.';
const result = explain(str, context);

console.log(result);
// => 'I am Jackson Tian, I am 18 years old.'
```

## License
The MIT license
