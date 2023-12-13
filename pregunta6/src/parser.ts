import {
  letter,
  int,
  charWhere,
  string,
  whitespace,
  ParjsFailure,
  Trace,
  ParjsCombinator,
  ParjsResult,
  Parjser,
} from "parjs";
import {
  between,
  manySepBy,
  or,
  then,
  many,
  stringify,
  later,
  recover,
  map,
} from "parjs/combinators";

interface Expression {
  atom?: Atom;
  value?: string;
  expression?: Expression[];
  stringify(): string;
}

class Atom implements Expression {
  constructor(public value: string) {}
  stringify() {
    return `${this.value}`;
  }
}

class Variable implements Expression {
  constructor(public value: string) {}
  stringify() {
    return `${this.value}`;
  }
}

class Structure implements Expression {
  constructor(
    public atom: Atom,
    public expression: Expression[],
  ) {}

  stringify() {
    let args = "";
    this.expression.forEach((exp, index) => {
      if (index === 0) {
        args = `${exp.stringify()}`;
      } else {
        args = `${args}, ${exp.stringify()}`;
      }
    });

    return `${this.atom.stringify()}(${args})`;
  }
}

class Action {
  constructor(
    public action: string,
    public expressions: Expression | Expression[],
  ) {}
}

class Rule {
  constructor(
    public head: Expression,
    public expressions: Expression[],
  ) {}
  stringify() {
    let res = `${this.head.stringify()} :-`;
    this.expressions.forEach((exp, index) => {
      if (index === 0) {
        res = `${res} ${exp.stringify()}`;
      } else {
        res = `${res}, ${exp.stringify()}`;
      }
    });

    return res;
  }
}

const atomRegex = new RegExp("^[a-z]");
const variableRegex = new RegExp("^[A-Z]");

const atom = charWhere((char) =>
  atomRegex.test(char) ? true : new ParjsFailure({ kind: "Soft" } as Trace),
).pipe(
  then(letter().pipe(or(int())).pipe(many(), stringify())),
  stringify(),
  map((str) => new Atom(str)),
);

const variable = charWhere((char) =>
  variableRegex.test(char) ? true : new ParjsFailure({ kind: "Soft" } as Trace),
).pipe(
  then(letter().pipe(or(int())).pipe(many(), stringify())),
  stringify(),
  map((str) => new Variable(str)),
);

const args = later();
const structure = later();

args.init(
  structure
    .pipe(or(atom, variable))
    .pipe(between(whitespace()))
    .pipe(manySepBy(","))
    .pipe(between("(", ")")),
);

structure.init(
  atom.pipe(
    then(args),
    recover(() => ({ kind: "Soft" })) as ParjsCombinator<
      [Atom, unknown],
      [Atom, Expression[]]
    >,
    map((arr: [Atom, Expression[]]) => new Structure(arr[0], arr[1])),
  ),
);

const expression: Parjser<Expression> = structure.pipe(
  or(atom, variable),
) as Parjser<Expression>;
const def = string("DEF ")
  .pipe(then(expression.pipe(manySepBy(whitespace()))))
  .pipe(map((arr) => new Action(arr[0], arr[1])));
const req = string("ASK ")
  .pipe(then(expression))
  .pipe(map((arr) => new Action(arr[0], arr[1])));

const lexer = def.pipe(or(req, expression));

const parser = (input: string): ParjsResult<Expression | Action> => {
  return lexer.parse(input);
};

const actionToExpression = (action: Action) => {
  if (action.action === "ASK ") return null;

  let expressions = action.expressions as Expression[];
  if (expressions.length === 1) {
    return expressions[0];
  } else {
    return new Rule(expressions[0], expressions.slice(1));
  }
};

export {
  Atom,
  Variable,
  Structure,
  Expression,
  Action,
  Rule,
  actionToExpression,
  parser,
};
