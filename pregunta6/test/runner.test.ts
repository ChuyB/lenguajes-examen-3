import { Atom, Expression } from "../src/parser";
import { State, updateState } from "../src/runner";

describe("Changes state", () => {
  it("Should add new expressions to state", () => {
    let state: State = [];
    updateState("DEF foo", state);
    updateState("DEF foo(bar)", state);
    updateState("DEF foo(bar) a(b) c(D)", state);

    expect(JSON.stringify(state)).toEqual(
      JSON.stringify([
        { value: "foo" },
        { atom: { value: "foo" }, expression: [{ value: "bar" }] },
        {
          head: { atom: { value: "foo" }, expression: [{ value: "bar" }] },
          expressions: [
            { atom: { value: "a" }, expression: [{ value: "b" }] },
            { atom: { value: "c" }, expression: [{ value: "D" }] },
          ],
        },
      ]),
    );
  });

  it("Should not add ASK to state", () => {
    let state: State = [];

    updateState("ASK foo", state);
    expect(state).toEqual([]);
  });

  it("Should throw error", () => {
    let state: State = [];

    expect(updateState("DEF 3rror", state)).toEqual(
      "parsers did not consume all input",
    );
  });
});

describe("Evaluates consults", () => {
  it("Should evaluate to true", () => {
    let state: State = [];

    updateState("DEF foo", state);
    updateState("DEF foo(a)", state);
    updateState("DEF foo(bar(A))", state);

    let atom1 = updateState("ASK foo", state) as Atom;
    let atom2 = updateState("ASK foo(a)", state) as Atom;
    let atom3 = updateState("ASK foo(bar(A))", state) as Atom;

    expect(atom1.stringify()).toEqual("true");
    expect(atom2.stringify()).toEqual("true");
    expect(atom3.stringify()).toEqual("true");
  });

  it("Should evaluate to false", () => {
    let state: State = [];

    updateState("DEF foo", state);
    updateState("DEF foo(a)", state);
    updateState("DEF foo(bar(A))", state);

    let atom1 = updateState("ASK foo(b)", state) as Atom;

    expect(atom1.stringify()).toEqual("false");
  });

  it("Should instantiate structures correctly", () => {
    let state: State = [];

    updateState("DEF foo(bar, a)", state);
    updateState("DEF foo(fooBar, a)", state);
    updateState("DEF foo(fooBarBar, a)", state);
    updateState("DEF foo(barFooBar, a)", state);

    let expressions1 = updateState("ASK foo(X, a)", state) as Expression[];
    let expressions2 = updateState("ASK foo(bar, X)", state) as Expression[];

    expect(JSON.stringify(expressions1)).toEqual(
      JSON.stringify([
        {
          atom: { value: "foo" },
          expression: [{ value: "bar" }, { value: "a" }],
        },
        {
          atom: { value: "foo" },
          expression: [{ value: "fooBar" }, { value: "a" }],
        },
        {
          atom: { value: "foo" },
          expression: [{ value: "fooBarBar" }, { value: "a" }],
        },
        {
          atom: { value: "foo" },
          expression: [{ value: "barFooBar" }, { value: "a" }],
        },
      ]),
    );

    expect(JSON.stringify(expressions2)).toEqual(
      JSON.stringify([
        {
          atom: { value: "foo" },
          expression: [{ value: "bar" }, { value: "a" }],
        },
      ]),
    );
  });

  it("Should verify rules", () => {
    let state: State = [];

    updateState("DEF bar(a)", state);
    updateState("DEF bar(b)", state);
    updateState("DEF foo(A, B) bar(A) bar(B)", state);
    let exp1 = updateState("ASK foo(a, b)", state);

    expect((exp1 as Atom).stringify()).toEqual("true");
  });

  it("Should instantiate rules", () => {
    let state: State = [];
    updateState("DEF a(b, c)", state);
    updateState("DEF a(c, d)", state);
    updateState("DEF f(B, C) a(B, R) a(R, C)", state);

    let exp1 = updateState("ASK f(X, Y)", state);

    expect(JSON.stringify(exp1)).toEqual(
      JSON.stringify([
        { var: { value: "X" }, instance: { value: "b" } },
        { var: { value: "Y" }, instance: { value: "d" } },
      ]),
    );
  });
});
