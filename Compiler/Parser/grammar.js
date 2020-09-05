// Generated automatically by nearley, version 2.19.6
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "main", "symbols": ["stmts"], "postprocess": d => ({type: "module", body: d})},
    {"name": "stmts$ebnf$1", "symbols": []},
    {"name": "stmts$ebnf$1", "symbols": ["stmts$ebnf$1", "stmt"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "stmts", "symbols": ["stmts$ebnf$1"], "postprocess": id},
    {"name": "stmt", "symbols": ["assign_stmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["if_stmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["exp_stmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["empty_stmt"], "postprocess": null},
    {"name": "assign_stmt", "symbols": ["assign", "stmt_sep"], "postprocess": d => d[0]},
    {"name": "exp_stmt", "symbols": ["exp", "stmt_sep"], "postprocess": d => d[0]},
    {"name": "empty_stmt$subexpression$1", "symbols": ["_", "stmt_sep"]},
    {"name": "empty_stmt", "symbols": ["empty_stmt$subexpression$1"], "postprocess": null},
    {"name": "exp", "symbols": ["sum"]},
    {"name": "sum", "symbols": ["sum", /[+-]/, "term"], "postprocess": d => ({ type: "bin_exp", op: d[1],a: d[0],b: d[2]})},
    {"name": "sum", "symbols": ["term"], "postprocess": id},
    {"name": "term", "symbols": ["term", /[/*]/, "exp"], "postprocess": d => ({ type: "bin_exp", op: d[1],a: d[0],b: d[2]})},
    {"name": "term", "symbols": ["expon"], "postprocess": id},
    {"name": "expon", "symbols": ["jsonfloat"]},
    {"name": "assign", "symbols": ["fqn", {"literal":"="}, "exp"], "postprocess":  d => ({
            type: "assignement",
            identifier: d[0],
            init: d[1]
        }) },
    {"name": "if_stmt$ebnf$1$subexpression$1", "symbols": [{"literal":"else"}, "__", "stmt"]},
    {"name": "if_stmt$ebnf$1", "symbols": ["if_stmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "if_stmt$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "if_stmt", "symbols": [{"literal":"if"}, "__", "boolean_exp", "_", "if_body", "if_stmt$ebnf$1"], "postprocess":  
            d => {  
        console.log(d);
        return ({
                type: "if",
                test: d[2],
                body: d[4],
            })}
        },
    {"name": "boolean_exp", "symbols": ["bool_or_exp"], "postprocess": id},
    {"name": "boolean_exp", "symbols": [{"literal":"("}, "boolean_exp", {"literal":")"}], "postprocess": d => d[1]},
    {"name": "bool_or_exp", "symbols": ["bool_or_exp", {"literal":"||"}, "bool_and_exp"], "postprocess": d => ({ type:"bool_exp", op: "or", a: d[0], b: d[2]})},
    {"name": "bool_or_exp", "symbols": ["bool_and_exp"], "postprocess": id},
    {"name": "bool_and_exp", "symbols": ["bool_and_exp", {"literal":"&&"}, "bool_not_exp"], "postprocess": d => ({ type:"bool_exp", op: "and", a: d[0], b: d[2]})},
    {"name": "bool_and_exp", "symbols": ["bool_not_exp"], "postprocess": id},
    {"name": "bool_not_exp", "symbols": [{"literal":"!"}, "bool_not_exp"], "postprocess": d => ({ type:"unary_bool_exp", op: "not", a: d[1]})},
    {"name": "bool_not_exp", "symbols": ["fqn"], "postprocess": id},
    {"name": "bool_not_exp", "symbols": ["boolean"], "postprocess": id},
    {"name": "if_body", "symbols": [{"literal":":"}, "stmt"], "postprocess": d => d[1]},
    {"name": "if_body", "symbols": [{"literal":"{"}, "stmts", {"literal":"}"}], "postprocess": d=> d[1]},
    {"name": "fqn$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "fqn"]},
    {"name": "fqn$ebnf$1", "symbols": ["fqn$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "fqn$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fqn", "symbols": ["identifier", "fqn$ebnf$1"], "postprocess": d => d.join("")},
    {"name": "identifier$ebnf$1", "symbols": []},
    {"name": "identifier$ebnf$1", "symbols": ["identifier$ebnf$1", /[0-9a-zA-Z_]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "identifier", "symbols": [/[a-zA-Z_]/, "identifier$ebnf$1"], "postprocess": id},
    {"name": "stmt_sep", "symbols": [/[;\n]/]},
    {"name": "boolean", "symbols": [{"literal":"true"}], "postprocess": true},
    {"name": "boolean", "symbols": [{"literal":"false"}], "postprocess": false}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
