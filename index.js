"use strict";

let workspace = null;

const loadXml = url => {
  return fetch(url)
    .then(response => response.text())
    .then(data => data)
    .catch(error => console.error(error));
};

const makeWorkspace = toolbox => {
  const blocklyArea = document.getElementById("blocklyArea");

  workspace = Blockly.inject(blocklyArea, makeOption(toolbox));
  Blockly.svgResize(workspace);

  const updateWorkspace = () => {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    console.log(xmlText);
  };

  workspace.addChangeListener(updateWorkspace);
};

const makeOption = toolbox => {
  return {
    toolbox: toolbox,
    collapse: true,
    maxBlocks: Infinity,
    trashcan: true,
    tooltips: true,
    css: true,
    media: "https://blockly-demo.appspot.com/static/media/",
    rtl: false,
    scrollbars: true,
    sounds: true,
    oneBasedIndex: true
  };
};

// make block functions
const startBlock = connectedBlock => {
  return `<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start"><next>${connectedBlock}</next></block></xml>`;
};

const conditionBlock = (conditionText, yesBlock, noBlock) => {
  return `<block type="condition"><field name="condition_name">${conditionText}</field><statement name="yes">${yesBlock}</statement><statement name="no">${noBlock}</statement></block>`;
};

const targetBlock = text => {
  return `<block type="target"><field name="target_name">${text}</field></block>`;
};

const parse = json => {
  if (json.isCondition) {
    const yesBlock = parse(json.yes);
    const noBlock = parse(json.no);
    return conditionBlock(json.link, yesBlock, noBlock);
  }
  return targetBlock(json.link);
};

const initBlock = () => {
  const inputExample = {
    link: 1,
    isCondition: true,
    yes: {
      link: 2,
      isCondition: false
    },
    no: {
      link: 3,
      isCondition: true,
      yes: {
        link: 4,
        isCondition: false
      },
      no: {
        link: 5,
        isCondition: false
      }
    }
  };

  const xmlText = startBlock(parse(inputExample));
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
};

(async () => {
  const requestUrl = ["/toolbox.xml"];

  const result = await Promise.all(requestUrl.map(loadXml));

  const htmlToolbox = result[0];
  makeWorkspace(htmlToolbox);
  initBlock();
})();
