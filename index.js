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

(async () => {
  const requestUrl = ["/toolbox.xml"];

  const result = await Promise.all(requestUrl.map(loadXml));

  const htmlToolbox = result[0];
  makeWorkspace(htmlToolbox);
})();
