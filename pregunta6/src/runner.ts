import { ParjsFailure, ParjsParsingFailure } from "parjs";
import {
  Rule,
  Expression,
  Action,
  parser,
  actionToExpression,
  Atom,
  Variable,
  Structure,
} from "./parser.js";

type State = (Expression | Rule)[];

const updateState = (input: string, state: State) => {
  let expression: Expression | Action;

  try {
    const { value } = parser(input);
    expression = value;
    let newRule;
    if (expression instanceof Action) {
      newRule = actionToExpression(expression);
      if (newRule !== null) {
        state.push(newRule);
      } else {
        return evaluate(expression, state);
      }
    }
  } catch (err) {
    if (err instanceof ParjsFailure) {
      console.log(err.trace.reason);
      return err.trace.reason;
    }

    if (err instanceof ParjsParsingFailure) {
      console.log(err.failure.trace.reason);
      return err.failure.trace.reason;
    }

    if (err instanceof Error) {
      console.log(err.message);
      return err.message;
    }
  }
};

const evaluate = (action: Action, state: State) => {
  if (action.action === "DEF ") return [];

  let expression = action.expressions as Expression;

  let stateExpression = state.filter((exp) => {
    if (exp instanceof Rule)
      return exp.head.atom?.stringify() == expression.atom?.stringify();
    if (exp instanceof Atom && expression instanceof Atom)
      return exp.stringify() == expression.stringify();
    if (exp instanceof Structure && expression instanceof Structure)
      return exp.atom.stringify() == expression.atom.stringify();
  });

  if (stateExpression.length === 0)
    throw new Error(
      `La expresión ${expression.stringify()} no ha sido definida`,
    );

  if (expression instanceof Atom) return new Atom("true");
  if (expression instanceof Variable)
    throw new Error("No es posible evaluar una variable por sí sola");

  if (expression instanceof Structure) {
    const expressions = expression.expression;
    let responses: Expression[] = [];

    let facts = stateExpression.filter(
      (exp) => !(exp instanceof Rule),
    ) as Rule[];
    let rules = stateExpression.filter((exp) => exp instanceof Rule) as Rule[];

    let existingFact = facts.find(
      (fact) => fact.stringify() === expression.stringify(),
    );
    if (existingFact != undefined) return new Atom("true");

    rules.forEach((rule) => {
      rule.expressions.forEach((exp) => {
        let expString = exp.stringify();
        (rule.head as Structure).expression.forEach((exp, index) => {
          expString = replaceArgs(
            expressions[index].stringify(),
            exp.stringify(),
            expString,
          );
        });
        let res = updateState(`ASK ${expString}`, state);

        if (res instanceof Atom) {
          responses.push(res);
        } else {
          responses.push(...(res as Expression[]));
        }
      });
    });

    let magic: any = [];
    rules.forEach((rule) => {
      expression.expression?.forEach((exp, index) => {
        if (exp instanceof Variable) {
          let innerIndex: number = 0;
          let currentVar = (rule.head as Structure).expression[index];

          let currentArg = rule.expressions.find((ruleExp) =>
            (ruleExp as Structure).expression.find((argExp, inIndex) => {
              if (argExp.stringify() === currentVar.stringify()) {
                innerIndex = inIndex;
                return true;
              }
              return false;
            }),
          );

          if (currentArg === undefined) return;

          let caIndex = rule.expressions.indexOf(currentArg);
          let instance = (responses[caIndex] as Structure).expression[
            innerIndex
          ];
          magic = [
            ...magic,
            {
              var: (expression as Structure).expression[index],
              instance,
            },
          ];
        }
      });
    });

    if (magic.length !== 0) return magic;

    if (
      responses.length != 0 &&
      responses.every(
        (exp) => JSON.stringify(exp) === JSON.stringify({ value: "true" }),
      )
    ) {
      return new Atom("true");
    } else if (
      responses.length != 0 &&
      responses.some(
        (exp) => JSON.stringify(exp) === JSON.stringify({ value: "false" }),
      )
    ) {
      return new Atom("false");
    }

    if (responses.length > 0) return new Atom("true");

    let estructureExpression = stateExpression.filter(
      (exp) => exp instanceof Structure,
    );

    estructureExpression = estructureExpression.filter((exp) => {
      let notAllowed = expression.expression?.find((inExp, index) => {
        return (
          !(inExp instanceof Variable) &&
          (exp as Structure).expression[index].stringify() != inExp.stringify()
        );
      });
      return notAllowed === undefined;
    });

    responses.push(...estructureExpression);

    return responses.length === 0 ? new Atom("false") : responses;
  }

  return new Atom("false");
};

const replaceArgs = (input: string, toReplace: string, objective: string) => {
  return objective.split(toReplace).join(input);
};

export { State, updateState, evaluate };
