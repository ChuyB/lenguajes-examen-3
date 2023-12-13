import inquirer from "inquirer";
import { Class, addClass, findClass, getMethods } from "./clases.js";

enum Action {
  CLASS,
  DESCRIBIR,
  SALIR,
}

async function askForAction() {
  const { action } = await inquirer.prompt({
    name: "action",
    type: "input",
    message: "Ingrese la acción: ",
  });
  return action;
}

function parseAction(input: string): {
  action: Action;
  content: string;
} {
  let parsedAction = input.split(" ");
  let content = parsedAction.splice(1).join(" ");
  let action = Action[parsedAction[0] as keyof typeof Action];
  return { action, content };
}

const main = async () => {
  let listOfClasses: Class[] = [];

  while (true) {
    let rawAction = await askForAction();
    let { action, content } = parseAction(rawAction);
    switch (action) {
      case Action.CLASS:
        try {
          addClass(content, listOfClasses);
        } catch (error) {
          if (error instanceof Error) console.log(error.message);
        }
        break;

      case Action.DESCRIBIR:
        try {
          let currentClass = findClass(content, listOfClasses);
          if (currentClass === undefined)
            throw new Error(`La clase ${content} no existe`);

          let methods = getMethods(currentClass);
          methods.forEach(([name, parent]) => {
            console.log(`${name} -> ${parent} :: ${name}`);
          });
        } catch (error) {
          if (error instanceof Error) console.log(error.message);
        }
        break;

      case Action.SALIR:
        process.exit(0);
    }
  }
};

await main();
