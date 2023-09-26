import {
  escapeHtml,
  unescapeHtml,
  WrapMarkdown,
  ExtractMarkdown,
} from "./utils";

import DialogMarkdown from "./editor";

const markdownStyleTag = "pluginMarkdown=1;";

Draw.loadPlugin(function (ui) {
  try {
    mxResources.parse("useMarkdown=use markdown syntax");
    mxResources.parse("noMarkdown=don't use markdown syntax");
    // Adds action
    AddAction(ui);
    AddPopupMenuItem(ui);
    ui.editor.graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) =>
      HandleEditMarkdown(ui, sender, evt)
    );
  } catch (e) {
    console.log(e);
  }
});
function isCellPluginMarkdown(cell) {
  if (!cell) {
    return false;
  }
  if (cell.style.indexOf(markdownStyleTag) < 0) {
    return false;
  }
  return true;
}
function AddPopupMenuItem(ui) {
  const uiAddPopupMenuItems = ui.menus.addPopupMenuItems;
  const graph = ui.editor.graph;
  ui.menus.addPopupMenuItems = function (menu, cell, evt) {
    uiAddPopupMenuItems.apply(this, arguments);
    if (graph.isSelectionEmpty()) return;
    const curCell = graph.getSelectionCell();
    if (isCellPluginMarkdown(curCell)) {
      this.addMenuItems(menu, ["-", "noMarkdown"], null, evt);
    } else {
      this.addMenuItems(menu, ["-", "useMarkdown"], null, evt);
    }
  };
}

function HandleEditMarkdown(ui, sender, evt) {
  const cell = evt.getProperty("cell");
  if (isCellPluginMarkdown(cell)) {
    const dlg = new DialogMarkdown(ui, cell);
    evt.consume();
  }
}

function AddAction(ui) {
  ui.actions.addAction("useMarkdown", function () {
    const graph = ui.editor.graph;
    const curCell = graph.getSelectionCell();
    if (typeof curCell.value !== "string") {
      ui.showError(
        "markdown plugin",
        "The cell doesn't support Markdown syntax"
      );
      return;
    }
    graph.getModel().beginUpdate();
    curCell.setStyle(markdownStyleTag + curCell.style);
    // wrap actual content with div tag
    // curCell.setValue(`<div data-content="${unescapeStr}">${unescapeStr}</div>`);
    graph.labelChanged(curCell, WrapMarkdown(unescapeHtml(curCell.value))); // current content is escaped
    graph.getModel().endUpdate();
  });
  ui.actions.addAction("noMarkdown", function () {
    const graph = ui.editor.graph;
    const curCell = graph.getSelectionCell();
    if (typeof curCell.value !== "string") {
      ui.showError("markdown plugin", "This won't happen");
      return;
    }
    graph.getModel().beginUpdate();
    curCell.setStyle(curCell.style.replace(markdownStyleTag, ""));
    graph.labelChanged(curCell, escapeHtml(ExtractMarkdown(curCell.value))); // current content is html string
    graph.getModel().endUpdate();
  });
}
