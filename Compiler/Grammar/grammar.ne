@{%
const moo = require("moo");

const lexer = moo.compile({
    ws: {
        match:/[ \t\n\r]+/,
        lineBreaks: true
    },
    nl: { match: "\n", lineBreaks: true },
    stmt_sep: {
        match: /[\n;]/,
        lineBreaks: true
    },
    lparan: "(",
    rparan: ")",
    comma: ",",
    lbracket: "[",
    rbracket: "]",
    sBlock: "{",
    eBlock: "}",
    shl: "<<",
    shr: ">>",
    inc: "++",
    dec: "--",
    eq: "==",
    neq: "!=",
    leq: "<=",
    geq: ">=",
    le: "<",
    gt: ">",
    neq: "!=",
    exp: "^",
    assignment: "=",
    plus: "+",
    minus: "-",
    multiply: "*",
    divide: "/",
    modulo: "%",
    neg: "!",
    and: "&&",
    or: "||",
    colon: ":",
    annot: {
        match: /\@[a-bA-B_]+/
    },
    eq_op:{
        match: /==|!=/
    },
    comp_op:{
        match: /<|>|<=|>=/
    },
    comment: {
        match: /#[^\n]*/,
        value: s => s.substring(1)
    },
    string_literal: {
        match: /"(?:[^\n\\"]|\\["\\ntbfr])*"/, 
        value: s => JSON.parse(s)
    },
    number_literal: {
        match: /[0-9]+\.?[0-9]*/,
        value: s => +s
    },
    boolean_literal: {
        match: /true|false/,
        value: s => s === "true"
    },
    float_point_literal: {
        match: /\.[0-9]+/,
        value: s => +s
    },
    identifier: {
        match: /[a-z_][a-z_0-9]*/,
    },
});

const ret = (val) => () => val;
const noNull = (fn) => (d) => fn(d).filter(i => i !== null)
%}

@lexer lexer

main -> stmts {% d => ({type: "module", body: d.flat()}) %} # flatten the statements to one global array

stmts -> stmt tail_stmts:* {% d =>  [d[0], ...(d[1] ?? [])] %} 
tail_stmts -> _ stmt {% d => d[1]%}

stmt -> assign_stmt {%id%}
        | if_stmt {%id%}
        | exp_stmt {%id%}
        | block_stmt {%id%}

assign_stmt -> assign _ stmt_sep {% d => d[0] %}
exp_stmt -> exp _ stmt_sep {% d => d[0] %}
block_stmt -> "{" _ (stmt _):*  "}" {% noNull(d => (d[2] ? d[2] : []).flat()) %}

exp -> or {% id %}
    | "(" _ exp _ ")" {% d => d[2] %}


or -> or _ %or _ and {% d => ({ type:"bin_exp", op: "or", a: d[0], b: d[4]}) %} 
            | and {% id %}
and -> and _ %and _ eq {% d => ({ type:"bin_exp", op: "and", a: d[0], b: d[4]}) %}
            | eq {% id %}
eq -> eq _ eq_op _ comp {% d => ({ type:"bin_exp", op: d[2], a: d[0], b: d[4]}) %}
            | comp {% id %}
comp -> comp _ comp_op _ shifts {% d => ({ type:"bin_exp", op: d[2], a: d[0], b: d[4]}) %}
            | shifts {% id %}
shifts -> shifts _ shift_op _ sum {% d => ({ type:"bin_exp", op: d[2], a: d[0], b: d[4]}) %}
            | sum {% id %}
sum -> sum _ [+-] _ term {% d => ({ type: "bin_exp", op: d[2],a: d[0],b: d[4]}) %}
    | term {% id %}
term -> term _ [/*%] _ exp_pow {% d => ({ type: "bin_exp", op: d[2],a: d[0],b: d[4]}) %}
    | exp_pow {% id %}

exp_pow -> exp_pow _ %exp _ pref {% d => ({ type: "bin_exp", op: "exp",a: d[0],b: d[4]}) %}
        | pref {% id %}

pref -> "-" suff {% d=> ({ type:"unary_exp", op: "inv", a: d[1]}) %}
    | %neg suff {% d=> ({ type:"unary_exp", op: "neg", a: d[1]}) %}
    | suff {% id %}

suff -> atom %inc {% d=> ({ type:"unary_exp", op: "inc", a: d[0]}) %}
    | atom %dec {% d=> ({ type:"unary_exp", op: "dec", a: d[0]}) %}
    | atom {% id %}

atom -> num {% id %}
        | fqn {% id %}
        | boolean {% id %}


assign -> fqn _ "=" _ exp {% d => ({
    type: "assignement",
    identifier: d[0],
    init: d[4]
}) %}

if_stmt -> "if" __ exp _ if_body (_ "else" _ stmt):? {% 
    d => ({  
        type: "if",
        test: d[2],
        body: d[4],
        else: d[5] ? d[5][3] : null
    })
%}

if_body -> ":" _ stmt  {% d => [d[2]] %}
        | block_stmt {% id %}

# fully qualified name
fqn -> identifier ("." fqn):? {% d =>({
    type: "identifier",
    value: d.join(""),
}) %}

identifier -> %identifier {% id %}
stmt_sep -> %stmt_sep {% id %}

boolean -> %boolean_literal {% id %}

num -> %number_literal {% id %}
    | %float_point_literal {% id %}

eq_op -> %eq {% ret("==") %}
        | %neq {% ret("!=") %}

comp_op -> %leq {% ret("<=") %}
        | %geq {% ret(">=") %}
        | %le {% ret("<") %}
        | %gt {% ret(">") %}
shift_op -> %shl {% ret("<<") %}
        | %shr {% ret(">>") %}

__ -> %ws:+ {% ret(null) %}

_ -> %ws:* {% ret(null) %}