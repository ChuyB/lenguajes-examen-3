import { ParjsFailure } from "parjs";
import {
  Action,
  Atom,
  Expression,
  Rule,
  Structure,
  Variable,
  actionToExpression,
  parser,
} from "../src/parser";

describe("Auxiliary functions", () => {
  it("Should parse atoms", () => {
    let { value: atom1 } = parser("foo");
    let { value: atom2 } = parser("fooBar3f1");

    expect(atom1).toEqual(new Atom("foo"));
    expect(atom2).toEqual(new Atom("fooBar3f1"));
  });
  it("Should parse variables", () => {
    let { value: var1 } = parser("Var");
    let { value: var2 } = parser("Var1234");
    let { value: var3 } = parser("Var1foo234");

    expect(var1).toEqual(new Variable("Var"));
    expect(var2).toEqual(new Variable("Var1234"));
    expect(var3).toEqual(new Variable("Var1foo234"));
  });
  it("Should parse expressions", () => {
    let { value: exp1 } = parser("foo(a, A)");
    let { value: exp2 } = parser("foo(bar(a))");
    let { value: exp3 } = parser("in(c(e,P), t(i, o(N)))");

    expect(JSON.stringify(exp1)).toEqual(
      JSON.stringify({
        atom: { value: "foo" },
        expression: [{ value: "a" }, { value: "A" }],
      }),
    );

    expect(JSON.stringify(exp2)).toEqual(
      JSON.stringify({
        atom: { value: "foo" },
        expression: [{ atom: { value: "bar" }, expression: [{ value: "a" }] }],
      }),
    );

    expect(JSON.stringify(exp3)).toEqual(
      JSON.stringify({
        atom: { value: "in" },
        expression: [
          {
            atom: { value: "c" },
            expression: [{ value: "e" }, { value: "P" }],
          },
          {
            atom: { value: "t" },
            expression: [
              { value: "i" },
              { atom: { value: "o" }, expression: [{ value: "N" }] },
            ],
          },
        ],
      }),
    );
  });
});

describe("Creates definitions", () => {
  it("Should generate a list of structures", () => {
    let { value: def1 } = parser("DEF true");
    let { value: def2 } = parser("DEF foo(bar) true");
    let { value: def3 } = parser("DEF foo(a, bar(A)) bar(true) Falso");
    let { value: ask } = parser("ASK foo(a, bar(A))");

    expect(JSON.stringify(def1)).toEqual(
      JSON.stringify({
        action: "DEF ",
        expressions: [{ value: "true" }],
      }),
    );

    expect(JSON.stringify(def2)).toEqual(
      JSON.stringify({
        action: "DEF ",
        expressions: [
          { atom: { value: "foo" }, expression: [{ value: "bar" }] },
          { value: "true" },
        ],
      }),
    );

    expect(JSON.stringify(def3)).toEqual(
      JSON.stringify({
        action: "DEF ",
        expressions: [
          {
            atom: { value: "foo" },
            expression: [
              { value: "a" },
              { atom: { value: "bar" }, expression: [{ value: "A" }] },
            ],
          },
          {
            atom: { value: "bar" },
            expression: [{ value: "true" }],
          },
          {
            value: "Falso",
          },
        ],
      }),
    );

    expect(JSON.stringify(ask)).toEqual(
      JSON.stringify({
        action: "ASK ",
        expressions: {
          atom: { value: "foo" },
          expression: [
            { value: "a" },
            { atom: { value: "bar" }, expression: [{ value: "A" }] },
          ],
        },
      }),
    );
  });
});

describe("Throws error", () => {
  it("Should fail on bad syntax", () => {
    let { trace: err1 } = parser("atom-") as ParjsFailure;
    let { trace: err2 } = parser("exp(") as ParjsFailure;
    let { trace: err3 } = parser("4tom") as ParjsFailure;
    let { trace: err4 } = parser("Var(bar)") as ParjsFailure;
    let { trace: err5 } = parser("atom (foo)") as ParjsFailure;
    let { trace: err6 } = parser("atom(foo($))") as ParjsFailure;

    expect(err1.reason).toEqual("expecting a signed integer in base 10");
    expect(err2.reason).toEqual("parsers did not consume all input");
    expect(err3.reason).toEqual(
      "expecting 'DEF ' OR expecting 'ASK ' OR expecting a character matching a predicate OR expecting a character matching a predicate OR expecting a character matching a predicate",
    );
    expect(err4.reason).toEqual("parsers did not consume all input");
    expect(err5.reason).toEqual("parsers did not consume all input");
    expect(err6.reason).toEqual("parsers did not consume all input");
  });
});

describe("Stringifies structures", () => {
  it("Stringifies atom", () => {
    let atom = new Atom("true");
    expect(atom.stringify()).toEqual("true");
  });

  it("Stringifies variable", () => {
    let variable = new Variable("Bar");
    expect(variable.stringify()).toEqual("Bar");
  });

  it("Stringifies structure", () => {
    let str1 = new Structure(new Atom("foo"), [new Variable("X")]);
    let str2 = new Structure(new Atom("foo"), [
      new Variable("X"),
      new Atom("bar"),
    ]);
    let str3 = new Structure(new Atom("foo"), [
      new Structure(new Atom("bar"), [new Variable("Y")]),
    ]);
    let str4 = new Structure(new Atom("foo"), [
      new Structure(new Atom("bar"), [
        new Atom("a"),
        new Structure(new Atom("f"), [new Atom("x")]),
      ]),
    ]);

    expect(str1.stringify()).toEqual("foo(X)");
    expect(str2.stringify()).toEqual("foo(X, bar)");
    expect(str3.stringify()).toEqual("foo(bar(Y))");
    expect(str4.stringify()).toEqual("foo(bar(a, f(x)))");
  });
});

describe("Action to rule", () => {
  it("Should convert if def is a fact", () => {
    let { value: action } = parser("DEF foo");
    let expression = actionToExpression(action as Action) as Expression;
    expect(expression?.stringify()).toEqual("foo");
  });

  it("Should convert from action to rule", () => {
    let { value: action } = parser("DEF foo(bar) a(b) c(D)");
    let rule = actionToExpression(action as Action) as Rule;

    expect(rule?.stringify()).toEqual("foo(bar) :- a(b), c(D)");
  });

  it("Should not convert if action is ask", () => {
    let { value: action } = parser("ASK foo(bar)");
    let rule = actionToExpression(action as Action);
    expect(rule).toBeNull();
  });
});
