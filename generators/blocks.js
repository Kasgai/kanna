"use strict";

const blocks = [
  {
    type: "start",
    message0: "スタート",
    nextStatement: null,
    colour: 195,
    tooltip: "",
    helpUrl: ""
  },
  {
    type: "condition",
    message0: "条件 %1 %2 はい %3 いいえ %4",
    args0: [
      {
        type: "field_input",
        name: "condition_name",
        text: "3つの辺がある"
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
  },
  {
    type: "target",
    message0: "結果 %1",
    args0: [
      {
        type: "field_input",
        name: "target_name",
        text: "三角形"
      }
    ],
    previousStatement: null,
    colour: 135,
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
