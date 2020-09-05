@builtin "number.ne"
@builtin "whitespace.ne"

@{%
const moo = require("moo");

const lexer = moo.compile({
    ws: {
        match:/[ \t\n]+/,
        lineBreaks: true
    },
    nl: { match: "\n", lineBreaks: true },
    stmt_sep: {
        match: /[\;n]/,
        lineBreaks: true
    },
    lte: "<=",
    lt: "<",
    gte: ">=",
    gt: ">",
    eq: "==",
    lparan: "(",
    rparan: ")",
    comma: ",",
    lbracket: "[",
    rbracket: "]",
    sBlock: "{",
    eBlock: "}",
    assignment: "=",
    plus: "+",
    minus: "-",
    multiply: "*",
    divide: "/",
    modulo: "%",
    colon: ":",
    annot: {
        match: /\@[a-bA-B_]+/
    },
    comment: {
        match: /#[^\n]*/,
        value: s => s.substring(1)
    },
    string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/, 
        value: s => JSON.parse(s)
    },
    identifier: {
        match: /[a-z_][a-z_0-9]*/,
    },
    fun: "fun",
    while: "while",
    for: "for",
    if: "if"
});

%}

@lexer lexer

main -> stmts {% d => ({type: "module", body: d}) %}

stmts -> stmt:* {% id  %}


stmt -> assign_stmt {% id%} 
        | if_stmt {% id %}
        | exp_stmt {% id %}
        | empty_stmt {% null %}

assign_stmt -> assign stmt_sep {% d => d[0] %}
exp_stmt -> exp stmt_sep {% d => d[0] %}
empty_stmt -> (_ stmt_sep) {% null %}

exp -> sum

sum -> sum [+-] term {% d => ({ type: "bin_exp", op: d[1],a: d[0],b: d[2]}) %}
    | term {% id %}
term -> term [/*] exp {% d => ({ type: "bin_exp", op: d[1],a: d[0],b: d[2]}) %}
    | expon {% id %}

expon -> jsonfloat


assign -> fqn "=" exp {% d => ({
    type: "assignement",
    identifier: d[0],
    init: d[1]
}) %}

if_stmt -> "if" __ boolean_exp _ if_body ("else" __ stmt):? {% 
    d => {  
console.log(d);
return ({
        type: "if",
        test: d[2],
        body: d[4],
    })}
%}

boolean_exp -> bool_or_exp {% id %}
            | "(" boolean_exp ")" {% d => d[1] %}

bool_or_exp -> bool_or_exp "||" bool_and_exp {% d => ({ type:"bool_exp", op: "or", a: d[0], b: d[2]}) %} 
            | bool_and_exp {% id %}
bool_and_exp -> bool_and_exp "&&" bool_not_exp {% d => ({ type:"bool_exp", op: "and", a: d[0], b: d[2]}) %}
            | bool_not_exp {% id %}


bool_not_exp -> "!" bool_not_exp {% d => ({ type:"unary_bool_exp", op: "not", a: d[1]}) %}
            | fqn {% id %}
            | boolean {% id %}


if_body -> ":" stmt  {% d => d[1] %}
        | "{" stmts "}" {% d=> d[1] %}

# fully qualified name
fqn -> identifier ("." fqn):? {% d => d.join("") %}

identifier -> [a-zA-Z_] [0-9a-zA-Z_]:* {%id%}
stmt_sep -> [;\n]

boolean -> "true" {% true %}
        | "false" {% false %}

#__ -> %ws:+ {% null %}

#_ -> %ws:* {% null %}