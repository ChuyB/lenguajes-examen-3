#!/usr/bin/env node

import inquirer from "inquirer";
import { State, updateState } from "./runner.js";
import { Atom, Rule, Structure } from "./parser.js";

async function askForAction() {
  const { action } = await inquirer.prompt({
    name: "action",
    type: "input",
    message: "Ingrese su acción: ",
  });

  return action;
}

async function consult() {
  const { action } = await inquirer.prompt({
    name: "action",
    type: "input",
    message: "¿Qué desea hacer?",
  });

  return action;
}

const main = async () => {
  let state: State = [];
  while (true) {
    const action = await askForAction();

    if (action === "SALIR") process.exit(0);

    let res = updateState(action, state);

    if (res === undefined) {
      let lastElement = state[state.length - 1];
      console.log(
        `Se ha definido ${lastElement instanceof Atom ? "el átomo" : ""}${
          lastElement instanceof Structure ? "el hecho" : ""
        }${
          lastElement instanceof Rule ? "la regla" : ""
        } ${lastElement.stringify()}`,
      );

      continue;
    }

    if (res instanceof Atom || res instanceof Structure) {
      console.log(res.stringify());
    }

    if (Array.isArray(res)) {
      let response = false;
      for (let i = 0; i < res.length; i++) {
        let el = res[i];
        if (el instanceof Structure) {
          console.log(`Satisfacible, si ${el.stringify()}`);
        } else {
          console.log(
            `Satisfacible, cuando ${el.var.stringify()} = ${el.instance.stringify()}`,
          );
        }
        let consultRes = await consult();
        if (consultRes === "ACEPTAR") {
          response = true;
          break;
        }
        if (consultRes !== "RECHAZAR") {
          console.log("Acción no valida (ACEPTAR/RECHAZAR)");
          break;
        }
      }

      response
        ? console.log("Consulta aceptada")
        : console.log("No es satisfacible");
    }
  }
};

await main();
