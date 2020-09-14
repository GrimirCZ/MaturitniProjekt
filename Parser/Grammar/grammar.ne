@{%
const moo = require("moo");
const DEBUG = false

const lexer = moo.states({
    main: {
        ws: {
            match:/[ \t\n\r]+/,
            lineBreaks: true
        },
        comment: {
            match: /#[^\n]*/,
        },
        multilineComment: {
            match: /\/\*[^]*?\*\//,
            lineBreaks: true,
        },
        sem: { match: ";"},
        lparan: "(",
        rparan: ")",
        comma: ",",
        dot: ".",
        colon: ":",
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
        pipe: "|",
        annot: {
            match: /\@[a-bA-B_]+/
        },
        eq_op:{
            match: /==|!=/
        },
        comp_op:{
            match: /<|>|<=|>=/
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
            type: moo.keywords({
                for: 'for',
                if: 'if',
                else: 'else',
                in: 'in'
            })
        },
    }
});

lexer.next = (next => () => {
    let tok;
    while ((tok = next.call(lexer)) && (tok.type === "comment" || tok.type === "multilineComment") ) {}
    return tok;
})(lexer.next);

function tokenStart(token) {
    return {
        line: token.line,
        col: token.col - 1
    };
}

const dbgLog = (name, d) => DEBUG && console.log(name, d)

const dbg = (name, fn) => d => {
    if (DEBUG){
        console.log(name, d)
    }

    return fn(d)
}

const count = (str, rch) => {
    let count = 0;

    for(ch of str){
       if (ch === rch)
            count++
    }

    return count;
}

function tokenEnd(token) {
    const text = "text" in token ? token.text : token.value;
    let line = token.line
    let col = token.col + text.length - 1
    try{

        const nlCount = count(text, "\n")
        const lastNl = text.lastIndexOf("\n") - 1

        if(nlCount > 0){
            line += nlCount
            col = text.length - lastNl
        }

    } catch(e){
        dbgLog("tokenEnd",token)
        throw e;
    }
    return {
        line: token.line,
        col: token.col + text.length - 1
    };
}

function convertToken(token) {
    return {
        type: token.type,
        value: token.value,
        start: 'start' in token ? token.start : tokenStart(token),
        end: 'end' in token ? token.end : tokenEnd(token)
    };
}

const convertTokenId = d => convertToken(d[0])

const opToToken = op => ({type: op.value, start: tokenStart(op), end: tokenEnd(op)})

const first = ar => ar[0]
const last = ar => ar[ar.length - 1]

const ret = (val) => () => val;
const noNull = (d) => d.filter(i => i !== null)
// replace empty token with an empty array
// v -> value
// d -> default value
const noEmpty = (v, d) => typeof(v) === "object" && "type" in v && v.type === "empty" ? d : v
%}

@lexer lexer

main -> _ stmts _ {% d => {
    const body = d[1].flat()
    
    return ({
        type: "module",
        body,
        start: convertToken(body[0]).start,
        end: convertToken(body[body.length - 1]).end,
    }) 
}%} # flatten the statements to one global array

stmts -> stmt tail_stmts:* {% d =>  [d[0], ...(d[1] ?? [])] %} 
tail_stmts -> _ stmt {% d => d[1]%}

stmt -> assign_stmt {%id%}
        | if_stmt {%id%}
        | for_stmt {%id%}
        | exp_stmt {%id%}
        | block_stmt {%id%}
        | empty_stmt {%id%}

assign_stmt -> assign _ stmt_sep {% d => d[0] %}
exp_stmt -> exp _ stmt_sep {% d => d[0] %}
block_stmt -> "{" _ (stmt _):*  "}" {% dbg("block_statement",d => {
  const body = noNull((d[2] ? d[2] : []).flat())

  return ({type: "block", statements: body, start:tokenStart(d[0]), end: tokenEnd(d[3]) })
 }) %}

empty_stmt -> stmt_sep {% d => ({type: "empty", start: tokenStart(d[0]), end: tokenEnd(d[0])}) %}
            
exp -> or {% id %}
    


or -> or _ %or _ and {% d => ({ type:"bin_exp", op: "or", a: d[0], b: d[4], start: d[0].start, end: d[4].end}) %} 
            | and {% id %}
and -> and _ %and _ eq {% d => ({ type:"bin_exp", op: "and", a: d[0], b: d[4], start: d[0].start, end: d[4].end}) %}
            | eq {% id %}
eq -> eq _ eq_op _ comp {% d => ({ type:"bin_exp", op: opToToken(d[2]), a: d[0], b: d[4], start: d[0].start, end: d[4].end}) %}
            | comp {% id %}
comp -> comp _ comp_op _ shifts {% d => ({ type:"bin_exp", op: opToToken(d[2]), a: d[0], b: d[4], start: d[0].start, end: d[4].end}) %}
            | shifts {% id %}
shifts -> shifts _ shift_op _ sum {% d => ({ type:"bin_exp", op: opToToken(d[2]), a: d[0], b: d[4], start: d[0].start, end: d[4].end}) %}
            | sum {% id %}
sum -> sum _ [+-] _ dot {% d => ({ type: "bin_exp", op: opToToken(d[2]),a: d[0],b: d[4], start: d[0].start, end: d[4].end}) %}
    | dot {% id %}
dot -> sum __ "." __ term {% d => ({ type: "bin_exp", op: "dot",a: d[0],b: d[4], start: d[0].start, end: d[4].end}) %}
    | term {% id %}
term -> term _ [*/%] _ exp_pow {% d => ({ type: "bin_exp", op: opToToken(d[2]), a: d[0],b: d[4], start: d[0].start, end: d[4].end}) %}
    | exp_pow {% id %}

exp_pow -> exp_pow _ %exp _ pref {% d => ({ type: "bin_exp", op: "exp",a: d[0],b: d[4], start: d[0].start, end: d[4].end}) %}
        | pref {% id %}

pref -> "-" suff {% d=> ({ type:"unary_exp", op: "inv", a: d[1], start: tokenStart(d[0]), end: d[1].end}) %}
    | %neg suff {% d=> ({ type:"unary_exp", op: "neg", a: d[1], start: tokenStart(d[0]), end: d[1].end}) %}
    | suff {% id %}

suff -> atom %inc {% d=> ({ type:"unary_exp", op: "inc", a: d[0], start: d[0].start, end: tokenEnd(d[1])}) %}
    | atom %dec {% d=> ({ type:"unary_exp", op: "dec", a: d[0], start: d[0].start, end: tokenEnd(d[1])}) %}
    | atom {% id %}

atom -> num {% convertTokenId %}
        | fqn {% id %}
        | array_literal {% id %}
        | boolean {% convertTokenId %}
        | "(" _ exp _ ")" {% d => ({
            ...d[2],
            start: tokenStart(d[0]),
            end: tokenEnd(d[4]),
            })
           %}
        | "|" _ exp _ "|" {% d => ({
            type: "unary_exp",
            op: "abs",
            value :d[2],
            start: tokenStart(d[0]),
            end: tokenEnd(d[4]),
            })
         %}

assign -> fqn _ "=" _ exp {% dbg("assign", d => ({
    type: "assignement",
    identifier: d[0],
    init: d[4],
    start: d[0].start,
    end: d[4].end
})) %}
    | ident_w_type _ "=" _ exp {% dbg("assign_w_type", d => ({
        type: "assignement",
        identifier: d[0],
        init: d[4],
        start: d[0].start,
        end: d[4].end
    })) %}

for_stmt -> "for" __ (for_binding_idents __ "in" __):? exp _ stmt_body {%
    dbg("for_stmt", d =>({  
        type: "for",
        bindings: d[2] ? d[2][0] : null,
        iter: d[3],
        body: d[5], 
        start: tokenStart(d[0]),
        end: d[5].end
    }))

%}

for_binding_idents -> identifier (_ "," _ identifier):? {%
    d => ({

        value: d[0],
        index: d[1] ? d[1][3] : null
    })
%}

if_stmt -> "if" __ exp __ stmt_body (_ "else" _ stmt):? {% 
   dbg("if_stmt", d =>({  
        type: "if",
        test: d[2],
        body: d[4],
        else: d[5] ? d[5][3] : null,
        start: tokenStart(d[0]),
        end: d[4].end
        }))
%}

stmt_body -> single_stmt  {% dbg("if_body_single", d => d[0]) %}
        | block_stmt {% dbg("if_body_block",id) %}

single_stmt -> assign_stmt {%id%}
        | if_stmt {%id%}
        | exp_stmt {%id%}
        | empty_stmt {%id%}

# fully qualified name
fqn -> identifier ("." identifier):* {% d =>({
    type: "identifier",
    value: d.join(""),
    start: tokenStart(d[0]),
    end:  d[1].length == 0 ? tokenEnd(d[0]) : tokenEnd(d[1][d[1].length - 1])
}) %}

array_literal -> "[" _ exp:? ("," _ exp _):* "]" {%
    dbg("array_literal", (d) => {
        let res = []

        if (d[2]){
            res = [d[2]]

            if(d[3]){

                for(let exp of d[3]){
                    res = [...res, exp[2]]
                }
            }
        }
        

        return {
            type: "array_literal",
            value: res,
            start: tokenStart(d[0]),
            end: tokenEnd(d[4])
        }
    })
%}



identifier -> %identifier {% id %}
ident_w_type -> %identifier _ ":" _ %identifier {%  dbg("ident_w_type",d => ({ident: d[0], type: d[4], start: tokenStart(d[0]), end: tokenEnd(d[4])})) %}
stmt_sep -> %sem {% id %}


boolean -> %boolean_literal {% id %}

num -> %number_literal {% id %}
    | %float_point_literal {% id %}

eq_op -> %eq {% id %}
        | %neq {% id %}

comp_op -> %leq {% id %}
        | %geq {% id %}
        | %le {% id %}
        | %gt {% id %}
shift_op -> %shl {% id %}
        | %shr {% id %}

__ -> %ws:+ {% id %}

_ -> %ws:* {% id %}