/**
 * support markdow syntax
 */
const markdownStyleTag = "pluginMarkdown=1;";

import { marked } from "marked";
import katex from "katex";

Draw.loadPlugin(function (ui) {
  initMarked();
  mxResources.parse("useMarkdown=use markdown syntax");
  mxResources.parse("noMarkdown=don't use markdown syntax");
  // Adds action
  AddAction(ui);
  AddPopupMenuItem(ui);
  ui.editor.graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) =>
    HandleEditMarkdown(ui, sender, evt)
  );
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

function escapeHtml(text) {
  // https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
  // Warning: it does not escape quotes so you can't use the output inside attribute values in HTML code.
  // [](https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript#:~:text=Warning:%20it%20does%20not%20escape%20quotes%20so%20you%20can't%20use%20the%20output%20inside%20attribute%20values%20in%20HTML%20code)

  // const textNode = document.createTextNode(text);
  // const div = document.createElement("div");
  // div.appendChild(textNode);
  // return div.innerHTML;

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function unescapeHtml(escapeHtml) {
  // const doc = new DOMParser().parseFromString(escapeHtml, "text/html");
  // return doc.documentElement.textContent;

  // https://www.educative.io/answers/how-to-escape-unescape-html-characters-in-string-in-javascript
  return escapeHtml
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function AddAction(ui) {
  ui.actions.addAction("useMarkdown", function () {
    const graph = ui.editor.graph;
    graph.getModel().beginUpdate();
    const curCell = graph.getSelectionCell();
    curCell.setStyle(markdownStyleTag + curCell.style);
    // wrap actual content with div tag
    // curCell.setValue(`<div data-content="${unescapeStr}">${unescapeStr}</div>`);
    graph.labelChanged(curCell, WrapMarkdown(unescapeHtml(curCell.value))); // current content is escaped
    graph.getModel().endUpdate();
  });
  ui.actions.addAction("noMarkdown", function () {
    const graph = ui.editor.graph;
    graph.getModel().beginUpdate();
    const curCell = graph.getSelectionCell();
    curCell.setStyle(curCell.style.replace(markdownStyleTag, ""));
    graph.labelChanged(curCell, escapeHtml(ExtractMarkdown(curCell.value))); // current content is html string
    graph.getModel().endUpdate();
  });
}

function HandleEditMarkdown(ui, sender, evt) {
  const cell = evt.getProperty("cell");
  if (isCellPluginMarkdown(cell)) {
    const dlg = new DialogMarkdown(ui, cell);
    evt.consume();
  }
}

/**
 *
 * @param {string} text html string
 * @returns
 */
function ExtractMarkdown(text) {
  const div = document.createElement("div");
  div.innerHTML = text;
  return unescapeHtml(div.firstChild.getAttribute("data-content"));
}
/**
 *
 * @param {string} text markdown string, not escape
 * @returns the string in data-content is escaped
 */
function WrapMarkdown(text) {
  return `<div data-content="${escapeHtml(text)}">${marked
    .parse(text)
    .replace(/\n/g, "")}</div>`;
}

class DialogMarkdown {
  constructor(ui, cell) {
    this.state = { ui, cell };
    const div = document.createElement("div");
    div.style =
      "display: flex; flex-direction: column; padding: 16px; height: inherit;";
    div.innerHTML = `
       <div style="flex: 1; display: flex; flex-direction: row; overflow-y: auto">
        <textarea id="plugin_markdown_textarea" style="width: 40%; resize: horizontal;"></textarea>
        <div id="plugin_markdown_preview" style="flex: 1; text-align: center; overflow-y: auto"></div>
       </div>
       <div style="flex: 0 0 4em; display: flex; flex-direction: row; align-items: end">
        <div id="plugin_markdown_buttons" style="flex: initial; text-align: right; align-self: flex-end;">
        <p style="margin-block: unset; font-size: 90%"> 
          <br />Help | 
          <a target="_blank" href="https://marked.js.org/">Syntax</a> |
        </p><br /></div>
       </div>
       <div style="flex: 0 0 32px;"></div>
      `;

    const textarea = div.querySelector("#plugin_markdown_textarea");
    textarea.value = ExtractMarkdown(cell.value);
    // textarea.value = ui.editor.graph.convertValueToString(
    //   this.state.cell
    // ); // Compatble with cell properties

    const preview = div.querySelector("#plugin_markdown_preview");
    const buttons = div.querySelector("#plugin_markdown_buttons");

    let win_width = 800;
    let win_height = 640;
    if (ui.diagramContainer.clientWidth < win_width)
      win_width = ui.diagramContainer.clientWidth - 20;
    if (ui.diagramContainer.clientHeight < win_height)
      win_height = ui.diagramContainer.clientHeight - 20;

    const win = new mxWindow(
      "Markdown parsed by marked",
      div,
      (ui.diagramContainer.clientWidth - win_width) / 2 +
        ui.diagramContainer.offsetLeft,
      (ui.diagramContainer.clientHeight - win_height) / 2 +
        ui.diagramContainer.offsetTop,
      win_width,
      win_height,
      true,
      true
    );
    win.setResizable(true);
    win.setMaximizable(true);
    win.setClosable(true);

    // Enables dropping files
    if (Graph.fileSupport) {
      function handleDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        if (evt.dataTransfer.files.length > 0) {
          const file = evt.dataTransfer.files[0];

          const reader = new FileReader();
          reader.onload = function (e) {
            textarea.value = e.target.result;
          };
          reader.readAsText(file);
        }
      }

      function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
      }

      function previewMarkdown() {
        try {
          marked.parse(textarea.value);
          // Display preview
          preview.innerHTML = marked.parse(textarea.value);
        } catch (e) {
          console.log(e);
        }
      }

      function handleInput(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        previewMarkdown();
      }

      previewMarkdown();
      // Setup the dnd listeners.
      textarea.addEventListener("dragover", handleDragOver, false);
      textarea.addEventListener("drop", handleDrop, false);
      textarea.addEventListener("input", handleInput, false);
    }

    const cancelBtn = mxUtils.button(mxResources.get("close"), () => {
      win.destroy();
    });

    cancelBtn.className = "geBtn";

    if (ui.editor.cancelFirst) {
      buttons.appendChild(cancelBtn);
    }

    const okBtn = mxUtils.button(mxResources.get("apply"), (evt) => {
      this.updateContent(textarea.value);
      win.destroy();
    });

    buttons.appendChild(okBtn);

    okBtn.className = "geBtn gePrimaryBtn";

    if (!ui.editor.cancelFirst) {
      buttons.appendChild(cancelBtn);
    }

    win.show();
    textarea.focus();
  }
  updateContent(text) {
    // show spin
    const ui = this.state.ui;
    const cell = this.state.cell;
    if (ui.spinner.spin(document.body, mxResources.get("inserting"))) {
      const graph = ui.editor.graph;
      graph.getModel().beginUpdate();
      graph.labelChanged(cell, WrapMarkdown(text));
      graph.getModel().endUpdate();
      ui.spinner.stop(); // stop spin

      if (cell != null) {
        graph.setSelectionCell(cell);
        // graph.scrollCellToVisible(cell);
      }
    }
  }
}

function initMarked() {
  const extension = {
    name: "math",
    level: "inline",
    start(src) {
      let index = src.match(/\$/)?.index;
      return index;
    },
    tokenizer(src, tokens) {
      const blockRule = /^\$\$((\\.|[^\$\\])+)\$\$/;
      const inlineRule = /^\$((\\.|[^\$\\])+)\$/;
      let match;
      if ((match = blockRule.exec(src))) {
        return {
          type: "math",
          raw: match[0],
          text: match[1].trim(),
          mathLevel: "block",
        };
      } else if ((match = inlineRule.exec(src))) {
        return {
          type: "math",
          raw: match[0],
          text: match[1].trim(),
          mathLevel: "inline",
        };
      }
    },
    renderer(token) {
      if (token.mathLevel === "block") {
        return katex.renderToString(token.text, {
          throwOnError: false,
          displayMode: true,
          output: "mathml",
        });
      } else if (token.mathLevel === "inline") {
        return katex.renderToString(token.text, {
          throwOnError: false,
          displayMode: false,
          output: "mathml",
        });
      }
    },
  };
  marked.use({ extensions: [extension] });
}
