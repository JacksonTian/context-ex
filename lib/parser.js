'use strict';

const Lexer = require('./lexer');
const e_TokenCode = Lexer.e_TokenCode;

function tab(n) {
  return '  '.repeat(n);
}

class Parser {
  constructor(source) {
    this.lexer = new Lexer(source);
    this.lexer.getch(); // read a char from source code
    this.code = '';
    this.parts = [];
    this.level = 0;
  }

  get token() {
    return this.lexer.token;
  }

  getToken() {
    this.lexer.getToken();
  }

  /***********************************************************
   * 功能:  跳过单词v,取下一单词,如果当前单词不是v,提示错误
   * v:   单词编号
   **********************************************************/
  skip(v) {
    if (this.token !== v) {
      throw new Error('缺少' + this.lexer.get_tkstr(v));
    }
    this.getToken();
  }

  /***********************************************************
   * 功能:  解析翻译单位
   *
   *  <expression_statement>::={E}<TK_EOF>
   **********************************************************/
  translation_expression() {
    while (this.token !== e_TokenCode.TK_EOF) {
      if (this.token === e_TokenCode.TK_LITERAL) {
        this.literal();
        this.getToken();
      } else if (this.token === e_TokenCode.TK_OPENEX) {
        this.expression();
        this.skip(e_TokenCode.TK_CLOSEEX);
      } else {
        this.lexer.error();
      }
    }
  }

  literal() {
    var value = this.getRaw(this.token);
    this.part('"' + value + '"');
  }

  /***********************************************************
   * 功能:  解析外部声明
   * l:   存储类型，局部的还是全局的
   *
   * <external_declaration>::=<function_definition>|<declaration>
   *
   * <function_definition>::= <type_specifier> <declarator><funcbody>
   *
   * <declaration>::= <type_specifier><TK_SEMICOLON>
   *    |<type_specifier>< init_declarator_list><TK_SEMICOLON>
   *
   * <init_declarator_list>::=
   *      <init_declarator>{<TK_COMMA> <init_declarator>}
   *
   * <init_declarator>::=
   *      <declarator>|<declarator> <TK_ASSIGN><initializer>
   *
   * 改写后文法：
   * <external_declaration>::=
   *  <type_specifier> (<TK_SEMICOLON>
   *      |<declarator><funcbody>
   *      |<declarator>[<TK_ASSIGN><initializer>]
   *       {<TK_COMMA> <declarator>[<TK_ASSIGN><initializer>]}
   *     <TK_SEMICOLON>
   **********************************************************/
  expression() {
    this.exp = '';
    this.getToken();
    while (this.token !== e_TokenCode.TK_CLOSEEX) {
      if (this.token >= e_TokenCode.TK_IDENT) {
        // @xx
        this.emitExp('context.' + this.getRaw(this.token));
      } else if (this.token === e_TokenCode.TK_CINT) {
        this.emitExp(this.getRaw(this.token));
      } else if (this.token < e_TokenCode.TK_OPENEX) {
        this.emitExp(' ' + this.getRaw(this.token) + ' ');
      } else {
        this.lexer.error();
      }
      this.getToken();
    }
    this.part('toFixed(' + this.exp + ')');
  }

  /***********************************************************
   * 功能:  提示错误，此处需要缺少某个语法成份
   * msg:   需要什么语法成份
   **********************************************************/
  expect(str) {
    this.lexer.error(str);
  }

  emitTab(code) {
    this.code += tab(this.level) + code;
  }

  emit(code) {
    this.code += code;
  }

  emitExp(code) {
    this.exp += code;
  }

  part(item) {
    this.parts.push(item);
  }

  getRaw(token) {
    var raw = this.lexer.get_tkstr(token);
    if (token >= e_TokenCode.TK_IDENT) {
      return raw.replace('@', '');
    }
    return raw;
  }

  parse() {
    this.emit('(function (context) {\n');
    this.emit(
      `  function toFixed(input) {
    if (typeof input !== 'number') {
      return input;
    }

    if (input % 1 !== 0) {
      return input.toFixed(2);
    }

    return input;
  }
`
    );
    this.level++;
    this.emitTab('// ' + this.lexer.source + '\n');
    this.emitTab('return ');
    this.getToken();
    this.translation_expression();
    this.emit(this.parts.join(' + '));
    this.emit(';\n');
    this.level--;
    this.emit('})\n');
  }

}

module.exports = Parser;
