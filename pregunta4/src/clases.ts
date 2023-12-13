interface Class {
  superClass?: Class;
  type: string;
  methods: [name: string, belongs: string][];
}

const findClass = (className: string, list: Class[]): Class | undefined => {
  let foundClass = list.find((cls) => cls.type === className);
  return foundClass;
};

const addClass = (input: string, list: Class[]) => {
  const parsedInput = input.split(" ");
  const type = parsedInput[0];

  const existsClass = findClass(type, list);
  if (existsClass != undefined) throw new Error(`La clase ${type} ya existe`);

  let newClass: Class = {
    type,
    methods: [],
  };

  let index = 1;
  if (parsedInput[1] === ":") {
    index = 3;
    const superClass = findClass(parsedInput[2], list);
    if (superClass === undefined)
      throw new Error(`La super clase ${parsedInput[2]} no se ha definido`);

    newClass.superClass = superClass;
    superClass.methods.forEach((method) => {
      if (!parsedInput.includes(method[0])) newClass.methods.push(method);
    });
  }

  for (let i = index; i < parsedInput.length; i++) {
    newClass.methods.push([parsedInput[i], type]);
  }

  list.push(newClass);
};

const getMethods = (typeClass: Class): [name: string, parent: string][] => {
  return typeClass.methods;
};

export { Class, addClass, getMethods, findClass };
