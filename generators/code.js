"use strict";

var Generator = Blockly.JavaScript;

Generator["start"] = function(block) {
  return "";
};

Generator["condition"] = function(block) {
  var dropdown_name = block.getFieldValue("condition_name");
  var yes_condition = Generator.statementToCode(block, "yes");
  var no_condition = Generator.statementToCode(block, "no");

  var result = `{"link":${dropdown_name},"isCondition":true`;

  if (yes_condition !== "") {
    result += `,"yes":${yes_condition}`;
  }
  if (no_condition !== "") {
    result += `,"no":${no_condition}`;
  }
  result += `}`;
  return result;
};

Generator["target"] = function(block) {
  var dropdown_name = block.getFieldValue("target_name");
  return `{"link":${dropdown_name},"isCondition":false}`;
};
