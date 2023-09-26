/**
 * support markdow syntax
 */

import ParseMarkdown from "./parseMd";
import { WrapMarkdown, ExtractMarkdown } from "./utils";

export default class DialogMarkdown {
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

    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.shiftKey) {
        this.updateContent(textarea.value);
        win.destroy();
      }
      if (event.key === "Escape") {
        win.destroy();
      }
    });

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
          // Display preview
          preview.innerHTML = ParseMarkdown(textarea.value);
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
