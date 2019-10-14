"use strict";

const blocks = [
  {
    type: "start",
    message0: "スタート",
    nextStatement: null,
    colour: 195,
    tooltip: "",
    helpUrl: ""
  }
];

blocks.forEach(block => {
  Blockly.Blocks[block.type] = {
    init: function() {
      this.jsonInit(block);
    }
  };
});

const initSelectFromTemplate = template => {
  const conditions = template.conditions.map(condition => [
    condition.text,
    condition.id + ""
  ]);
  const targets = template.targets.map(target => [target.name, target.id + ""]);

  if (conditions == null || targets == null) {
      throw new Error("cannot load template.");
  }

  const newSelectCondidtion = {
    type: "condition",
    message0: "条件 %1 %2 はい %3 いいえ %4",
    args0: [
      {
        type: "field_dropdown",
        name: "condition_name",
        options: conditions
      },
      {
        type: "input_dummy"
      },
      {
        type: "input_statement",
        name: "yes"
      },
      {
        type: "input_statement",
        name: "no"
      }
    ],
    previousStatement: null,
    colour: 300,
    tooltip: "",
    helpUrl: ""
  };
  Blockly.Blocks["condition"] = {
    init: function() {
      this.jsonInit(newSelectCondidtion);
    }
  };

  const newSelectTarget = {
    type: "target",
    message0: "結果 %1",
    args0: [
      {
        type: "field_dropdown",
        name: "target_name",
        options: targets
      }
    ],
    previousStatement: null,
    colour: 135,
    tooltip: "",
    helpUrl: ""
  };
  Blockly.Blocks["target"] = {
    init: function() {
      this.jsonInit(newSelectTarget);
    }
  };
};
