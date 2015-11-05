'use strict';

/* 单词存储结构定义 */
var Token = function (code, spelling) {
  this.code = code; // 编码
  this.spelling = spelling;  // 字符串
};

var EOF = -1;

// E = E
// E = string + E
// E = E + string
// E = '${' + e + '}'
// e = e + e
// e = e - e
// e = e * e
// e = e / e
// e = e % e
// e = e || e
// e = '@' + [A-Za-z][A-Za-z0-9]*
// e = 'string'
// e = "string"
// e = [0-9]+;

/* 单词编码 */
var e_TokenCode = {
  /* 运算符及分隔符 */
  TK_PLUS: 1,    // + 加号
  TK_MINUS: 2,   // - 减号
  TK_STAR: 3,    // * 星号
  TK_DIVIDE: 4,  // / 除号
  TK_MOD: 5,     // % 求余运算符
  TK_EQ: 6,       // == 等于号
  TK_NEQ: 7,      // != 不等于号
  TK_LT: 8,       // < 小于号
  TK_LEQ: 9,      // <= 小于等于号
  TK_GT: 10,      // > 大于号
  TK_GEQ: 11,     // >= 大于等于号
  TK_AND: 12,     // && 左圆括号
  TK_OR: 13,      // || 右圆括号
  TK_OPENEX: 14,  // ${ 左圆括号
  TK_CLOSEEX: 15, // } 右圆括号
  TK_EOF: 16,     // 文件结束符

  /* 常量 */
  TK_LITERAL: 17, // 字面量
  TK_CINT: 18,    // 整型常量
  TK_CCHAR: 19,   // 字符常量
  TK_CSTR: 20,    // 字符串常量

  // 标示符
  TK_IDENT: 21
};

/***********************************************************
 * 功能:  判断c是否为字母(a-z,A-Z)或下划线(-)
 * c:   字符值
 **********************************************************/
var is_nodigit = function (c) {
  return (c >= 'a' && c <= 'z') ||
    (c >= 'A' && c <= 'Z') ||
    c === '_';
};

/***********************************************************
 * 功能:  判断c是否为数字
 * c:   字符值
 **********************************************************/
var is_digit = function (c) {
  return c >= '0' && c <= '9';
};

var Lexer = function (source) {
  this.source = source;
  this.index = -1;
  this.ch = undefined;
  this.token = undefined;
  this.table = {};
  this.hashtable = {};
  this.init();
  this.state = 'literal';
};

/***********************************************************
 * 功能:  词法分析初始化
 **********************************************************/
Lexer.prototype.init = function () {
  this.keywords = [
    new Token(e_TokenCode.TK_PLUS,   "+"),
    new Token(e_TokenCode.TK_MINUS,  "-"),
    new Token(e_TokenCode.TK_STAR,   "*"),
    new Token(e_TokenCode.TK_DIVIDE, "/"),
    new Token(e_TokenCode.TK_MOD,    "%"),
    new Token(e_TokenCode.TK_EQ,     "=="),
    new Token(e_TokenCode.TK_NEQ,    "!="),
    new Token(e_TokenCode.TK_LT,     "<"),
    new Token(e_TokenCode.TK_LEQ,    "<="),
    new Token(e_TokenCode.TK_GT,     ">"),
    new Token(e_TokenCode.TK_GEQ,    ">="),

    new Token(e_TokenCode.TK_AND,    "&&"),
    new Token(e_TokenCode.TK_OR,     "||"),

    new Token(e_TokenCode.TK_OPENEX,    "${"),
    new Token(e_TokenCode.TK_CLOSEEX,   "}"),

    new Token(e_TokenCode.TK_EOF, "End_Of_File"),

    /* 常量 */
    new Token(e_TokenCode.TK_LITERAL,  "字面量"),
    new Token(e_TokenCode.TK_CINT,  "整型常量"),
    new Token(e_TokenCode.TK_CCHAR, "字符常量"),
    new Token(e_TokenCode.TK_CSTR,  "字符串常量"),

    new Token(0,       null)
  ];

  for (var i = 0; i < this.keywords.length; i++) {
    var tp = this.keywords[i];
    this.hashtable[tp.spelling] = tp;
    this.table[tp.code] = tp;
  }
};

/***********************************************************
 * 功能:  从SC源文件中读取一个字符
 **********************************************************/
Lexer.prototype.getch = function () {
  if (this.index >= this.source.length - 1) { //文件尾返回EOF
    this.ch = EOF;
  } else {
    this.index++;
    this.ch = this.source[this.index]; // 其它返回实际字节值
  }
  return this.ch;
};

Lexer.prototype.ungetch = function () {
  this.index--;
  this.ch = this.source[this.index]; // 其它返回实际字节值
  return this.ch;
};

Lexer.prototype.parse_literal = function () {
  this.tkstr = '';
  while (1) {
    if (this.ch === '$') { // $
      this.getch();
      if (this.ch === "{") { // ${
        if (this.tkstr.length) {
          this.token = e_TokenCode.TK_LITERAL;
          this.ungetch();
          this.ch = '$';
        } else {
          this.token = e_TokenCode.TK_OPENEX;
          this.getch();
        }
        this.state = 'expression';
        break;
      } else {
        this.ungetch();
        this.ch = '$';
        this.tkstr += this.ch;
        this.getch();
      }
    } else if (this.ch === EOF) {
      this.token = e_TokenCode.TK_LITERAL;
      break;
    } else {
      this.tkstr += this.ch;
      this.getch();
    }
  }
};

Lexer.prototype.parse_expression = function () {
  this.skip_white_space();
  switch (this.ch) {
  case "$": {
    this.getch();
    if (this.ch === "{") {
      this.token = e_TokenCode.TK_OPENEX;
      this.getch();
    } else {
      this.error();
    }
    break;
  }
  case "@":
    var token = this.parse_property();
    this.token = token.code;
    break;
  case "}":
    this.token = e_TokenCode.TK_CLOSEEX;
    this.getch();
    this.state = 'literal';
    break;
  case '+':
    this.token = e_TokenCode.TK_PLUS;
    this.getch();
    break;
  case '-':
    this.token = e_TokenCode.TK_MINUS;
    this.getch();
    break;
  case '*':
    this.token = e_TokenCode.TK_STAR;
    this.getch();
    break;
  case '/':
    this.token = e_TokenCode.TK_DIVIDE;
    this.getch();
    break;
  case '%':
    this.token = e_TokenCode.TK_MOD;
    this.getch();
    break;
  case '0': case '1': case '2': case '3':
  case '4': case '5': case '6': case '7':
  case '8': case '9':
    this.parse_num();
    this.token = e_TokenCode.TK_CINT;
    break;
  case '\'':
    this.parse_string(this.ch);
    this.token = e_TokenCode.TK_CCHAR;
    this.tkvalue = this.tkstr;
    break;
  case '\"':
    this.parse_string(this.ch);
    this.token = e_TokenCode.TK_CSTR;
    break;
  default:
    this.error();
  }
};

/***********************************************************
 *  功能: 取单词
 **********************************************************/
Lexer.prototype.getToken = function () {
  if (this.state === 'literal') {
    if (this.ch === EOF) {
      this.token = e_TokenCode.TK_EOF;
      return;
    }
    this.parse_literal();
  } else {
    this.parse_expression();
  }
};

var spaces = function (n) {
  var str = '';
  for (var i = 0; i < n; i++) {
    str += ' ';
  }
  return str;
};

Lexer.prototype.error = function () {
  // 上面字符以外的字符，只允许出现在源码字符串，不允许出现的源码的其它位置
  console.log('\n' + this.source);
  console.log(spaces(this.index) + '^');
  throw new SyntaxError("不认识的字符: " + this.ch);
};

/***********************************************************
 * 功能:  解析标识符
 **********************************************************/
Lexer.prototype.parse_property = function () {
  this.tkstr = this.ch;
  this.getch();
  while (is_nodigit(this.ch) || is_digit(this.ch)) {
    this.tkstr += this.ch;
    this.getch();
  }

  if (!this.hashtable[this.tkstr]) {
    var code = Object.keys(this.hashtable).length;
    var tp = new Token(code, this.tkstr);
    this.hashtable[this.tkstr] = tp;
    this.table[tp.code] = tp;
  }

  return this.hashtable[this.tkstr];
};

/***********************************************************
 *  功能: 忽略空格,TAB及回车
 **********************************************************/
Lexer.prototype.skip_white_space = function () {
  // 忽略空格,和TAB ch =='\n'
  while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
    if (this.ch === '\n') {
      // line number
    }
    this.getch();
  }
};

/***********************************************************
 * 功能:  解析字符常量、字符串常量
 * sep:   字符常量界符标识为单引号(')
      字符串常量界符标识为双引号(")
 **********************************************************/
Lexer.prototype.parse_string = function (sep) {
  var c;
  this.tkstr = sep;
  this.getch();

  for (;;) {
    if (this.ch === sep) {
      break;
    } else if (this.ch === '\\') {
      this.tkstr += this.ch;
      this.getch();

      switch(this.ch) { // 解析转义字符
      case '0':
        c = '\0';
        break;
      case 'a':
        c = '\a';
        break;
      case 'b':
        c = '\b';
        break;
      case 't':
        c = '\t';
        break;
      case 'n':
        c = '\n';
        break;
      case 'v':
        c = '\v';
        break;
      case 'f':
        c = '\f';
        break;
      case 'r':
        c = '\r';
        break;
      case '\"':
        c = '\"';
        break;
      case '\'':
        c = '\'';
        break;
      case '\\':
        c = '\\';
        break;
      default:
        c = this.ch;
        if (c >= '!' && c <= '~') {
          console.warn("非法转义字符: \'\\%c\'", c); // 33-126 0x21-0x7E可显示字符部分
        } else {
          console.warn("非法转义字符: \'\\0x%x\'", c);
        }
        break;
      }
      this.tkstr += this.ch;
      this.getch();
    } else {
      this.tkstr += this.ch;
      this.getch();
    }
  }
  this.tkstr += sep;
  this.getch();
};

/***********************************************************
 * 功能:  解析整型常量
 **********************************************************/
Lexer.prototype.parse_num = function () {
  this.tkstr = '';
  do {
    this.tkstr += this.ch;
    this.getch();
  } while (is_digit(this.ch));
  if (this.ch === '.') {
    do {
      this.tkstr += this.ch;
      this.getch();
    } while (is_digit(this.ch));
  }
  this.tkvalue = parseFloat(this.tkstr);
};

Lexer.prototype.get_tkstr = function (v) {
  if (v > Object.keys(this.table).length) {
    return null;
  } else if (v >= e_TokenCode.TK_LITERAL && v <= e_TokenCode.TK_CSTR) {
    return this.tkstr;
  } else {
    var tp = this.table[v];
    return tp.spelling;
  }
};

Lexer.e_TokenCode = e_TokenCode;

module.exports = Lexer;
