"use strict";

let workspace = null;
let projectId = null;
let templateObject = null;
const DEFAULT_TEMPLATE = "-Lghd7w_KIKDqZs64b6L";

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
  const saveWorkspace = () => {
    var code = Generator.workspaceToCode(workspace);
    if (code === "") {
      return;
    }

    firebase
      .database()
      .ref(`projects/${projectId}`)
      .update({
        "kanna-code": code,
        datetime: firebase.database.ServerValue.TIMESTAMP
      });
  };

  workspace.addChangeListener(saveWorkspace);
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
    return conditionBlock(json.link, yesBlock, noBlock);
  }

  return targetBlock(json.link);
};

const initBlock = (block, template) => {
  const xmlText = startBlock(parse(block, template));
  const xml = Blockly.Xml.textToDom(xmlText);
  workspace.clear();
  Blockly.Xml.domToWorkspace(xml, workspace);
};

const getProject = () => {
  if (projectId == null) {
    throw new Error("invalid project id");
    return;
  }
  const db = firebase.database();
  const projectDatabase = db.ref(`/projects/${projectId}`);
  projectDatabase.once("value", async snapshot => {
    const yattoko = snapshot.val()["kanna-code"];
    let template = snapshot.val()["template"];
    if (template == null) {
      template = DEFAULT_TEMPLATE;
      projectDatabase.update({
        template: template
      });
    }
    templateObject = await getTemplate(template);
    initSelectFromTemplate(templateObject);
    if (yattoko != null) {
      initBlock(JSON.parse(yattoko), templateObject, projectId);
    }
  });
};

const getTemplate = async templateId => {
  const db = firebase.database();
  const templateDatabase = db.ref(`/store/${templateId}`);
  return new Promise((resolve, reject) => {
    templateDatabase.once("value", snapshot => {
      try {
        resolve(snapshot.val());
      } catch (error) {
        reject(error);
      }
    });
  });
};

const validate = () => {
  const code = JSON.parse(Generator.workspaceToCode(workspace));
  const isSuccess =
    validateUseAllBlocks(templateObject, code) &&
    satisfyConditions(templateObject.targets, code, [], []);
  validateAnimation(isSuccess);
};

const validateUseAllBlocks = (template, code) => {
  const targets = template["targets"];
  for (const t of targets) {
    if (!searchTarget(code, t["id"])) {
      // not using all result blocks
      return false;
    }
  }
  return true;
};

const searchTarget = (code, targetId) => {
  if (code == null) {
    return false;
  }
  if (code.isCondition) {
    return (
      searchTarget(code["yes"], targetId) || searchTarget(code["no"], targetId)
    );
  }

  // result block
  return code.link === targetId;
};

const satisfyConditions = (targets, code, yes, no) => {
  if (code == null) {
    return false;
  }

  if (code.isCondition) {
    return (
      satisfyConditions(targets, code["yes"], [...yes, code.link], no) &&
      satisfyConditions(targets, code["no"], yes, [...no, code.link])
    );
  }

  // validate
  const targetCondition = targets.find(t => t.id == code.link)["condition"];
  if (targetCondition == null) {
    throw new Error("cannot find target");
  }
  for (const y of yes) {
    if (!targetCondition[y]) {
      return false;
    }
  }
  for (const n of no) {
    if (targetCondition[n]) {
      return false;
    }
  }

  return true;
};

// from yattoko
const validateAnimation = result => {
  $("#startButton").animate(
    { top: -$("#startButton").height(), opacity: 0 },
    { duration: "normal", easing: "swing" }
  );
  $("#validateButtonRope").animate(
    { top: -$("#startButton").height(), opacity: 0 },
    "normal",
    "swing",
    function() {
      if (result) {
        $("#validateResult").attr("src", "../yattoko/asset/succeeded.png");
      } else {
        $("#validateResult").attr("src", "../yattoko/asset/failed.png");
      }
      $("#validateResult").css({ top: -$("#validateResult").height() });
      $("#validateResult")
        .fadeIn("normal")
        .animate({ top: 70 }, { duration: "normal", easing: "swing" });
      $("#validateButtonRope").animate(
        { top: 0, opacity: 100 },
        { duration: "normal", easing: "swing" }
      );
    }
  );
};

const unValidated = () => {
  $("#startButton").css({ top: 70, opacity: 1 });
  $("#validateResult").hide();
};

(async () => {
  const requestUrl = ["/kanna/toolbox.xml"];

  const result = await Promise.all(requestUrl.map(loadXml));
  projectId = window.location.search.replace(/\?id=/, "");
  const htmlToolbox = result[0];
  makeWorkspace(htmlToolbox);

  getProject();
})();
