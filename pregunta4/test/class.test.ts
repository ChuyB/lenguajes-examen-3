import { Class, addClass, findClass, getMethods } from "../src/clases";

describe("Class management", () => {
  it("Should add a new class to a list of classes", () => {
    let list: Class[] = [];
    addClass("A f g h", list);

    const expectedClass: Class = {
      type: "A",
      methods: [
        ["f", "A"],
        ["g", "A"],
        ["h", "A"],
      ],
    };

    expect(list).toContainEqual(expectedClass);
  });

  it("Should add a new class with a super class", () => {
    let list: Class[] = [];
    addClass("A f g h", list);
    addClass("B : A i j", list);

    const expectedParentClass: Class = {
      type: "A",
      methods: [
        ["f", "A"],
        ["g", "A"],
        ["h", "A"],
      ],
    };

    const expectedClass: Class = {
      superClass: expectedParentClass,
      type: "B",
      methods: [
        ["f", "A"],
        ["g", "A"],
        ["h", "A"],
        ["i", "B"],
        ["j", "B"],
      ],
    };

    expect(list).toContainEqual(expectedClass);
  });
});

describe("Get methods", () => {
  it("Should return correct methods of a Class", () => {
    const expectedClass: Class = {
      type: "A",
      methods: [
        ["f", "A"],
        ["g", "A"],
        ["h", "A"],
      ],
    };

    let methods = getMethods(expectedClass);

    let expectedResult = [
      ["f", "A"],
      ["g", "A"],
      ["h", "A"],
    ];

    expect(methods).toEqual(expectedResult);
  });

  it("Should return correct methods of a Sub Class", () => {
    const superClass: Class = {
      type: "A",
      methods: [
        ["f", "A"],
        ["g", "A"],
        ["h", "A"],
      ],
    };

    let list = [superClass];
    addClass("B : A f i", list);

    let methods: [name: string, parent: string][] = [];
    let subClass = findClass("B", list);
    if (subClass != undefined) {
      methods = getMethods(subClass);
    }

    expect(methods).toContainEqual(["f", "B"]);
    expect(methods).toContainEqual(["g", "A"]);
    expect(methods).toContainEqual(["h", "A"]);
    expect(methods).toContainEqual(["i", "B"]);
  });
});
