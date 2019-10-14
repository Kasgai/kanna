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
    const code = Blockly.Xml.workspaceToDom(workspace);
    // TODO: output as Json.
    console.log(code);
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

const parse = (json, template) => {
  if (json.isCondition) {
    const yesBlock = json.hasOwnProperty("yes")
      ? parse(json.yes, template)
      : {};
    const noBlock = json.hasOwnProperty("no") ? parse(json.no, template) : {};
    const text =
      template.conditions.find(cond => cond.id === json.link).text || json.link;
    return conditionBlock(text, yesBlock, noBlock);
  }
  const text = template.targets.find(t => t.id === json.link).name || json.link;

  return targetBlock(text);
};

const initBlock = (block, template) => {
  const xmlText = startBlock(parse(block, template));
  const xml = Blockly.Xml.textToDom(xmlText);
  Blockly.Xml.domToWorkspace(xml, workspace);
};

const getProject = projectId => {
  if (projectId == null) {
    throw new Error("invalid project id");
    return;
  }
  const db = firebase.database();
  const projectDatabase = db.ref(`/projects/${projectId}`);
  projectDatabase.on("value", async snapshot => {
    const yattoko = snapshot.val()["code"];
    const template = snapshot.val()["template"];
    if (yattoko == null) {
      alert(`yattoko project was not found. projectId: ${projectId}`);
      return;
    }
    const templateObject = await getTemplate(template);
    initSelectFromTemplate(templateObject);
    initBlock(JSON.parse(yattoko), templateObject);
  });
};

const getTemplate = async templateId => {
  const db = firebase.database();
  const templateDatabase = db.ref(`/store/${templateId}`);
  return new Promise((resolve, reject) => {
    templateDatabase.on("value", snapshot => {
      try {
        resolve(snapshot.val());
      } catch (error) {
        reject(error);
      }
    });
  });
};

(async () => {
  const requestUrl = ["/kanna/toolbox.xml"];

  const result = await Promise.all(requestUrl.map(loadXml));

  const htmlToolbox = result[0];
  makeWorkspace(htmlToolbox);

  const projectId = window.location.search.replace(/\?id=/, "");
  getProject(projectId);
})();
