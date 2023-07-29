import { MarkdownPreviewView, TFile, ViewState, WorkspaceLeaf, MarkdownView, MarkdownSourceView } from "obsidian";
import { DIAGRAM_EDIT_VIEW_TYPE, DIAGRAM_VIEW_TYPE } from "./constants";
import DiagramPlugin from "./DiagramPlugin";
import DiagramViewBase from "./DiagramViewBase";

const FILE_EXTENSIONS = ["svg"];

export default class DiagramView extends MarkdownView {
  editActionElement: HTMLElement;
  isEditable: boolean;
  constructor(leaf: WorkspaceLeaf, plugin: DiagramPlugin) {
    super(leaf);
  }

  async onload() {
    super.onload();
    this.contentEl.classList.add("diagram-view");
    this.actionsEl.removeChild(this.actionsEl.firstChild);
    this.editActionElement = this.addAction("pencil", "Edit Diagram", () => {
      if (this.isEditable) {
        this.setEditView();
      }
    });
  }

  async setEditView() {
    await this.leaf.setViewState({
      type: DIAGRAM_EDIT_VIEW_TYPE,
      state: this.getState(),
      popstate: true,
    } as ViewState);
  }

  async onLoadFile(file: TFile) {
    this.setViewData(`![[${file.path}]]`, true);

    this.isEditable = await this.isDrawioFile(file);
    if (this.isEditable) {
      this.editActionElement.style.opacity = "1";
    } else {
      this.editActionElement.style.opacity = ".25";
    }
  }

  async onUnloadFile(file: TFile) {
    this.clear();
  }

  canAcceptExtension(extension: string) {
    return FILE_EXTENSIONS.contains(extension);
  }

  getViewType(): string {
    return DIAGRAM_VIEW_TYPE;
  }

  private async isDrawioFile(file: TFile) {
    const data = await this.app.vault.cachedRead(file);
    return this.isDrawioData(data);
  }

  private isDrawioData(data: string): boolean {
    if (typeof data !== "string") {
      return false;
    }
    const parser = new DOMParser();
    const diagramDocument = parser.parseFromString(data, "application/xml");

    const rootTagName = diagramDocument.documentElement.tagName.toLowerCase();

    if (rootTagName === "parsererror") {
      return false;
    }

    if (
      rootTagName === "mxfile" ||
      rootTagName === "mxgraph" ||
      rootTagName === "mxgraphmodel"
    ) {
      return true;
    }

    if (rootTagName === "svg") {
      return this.isDrawioData(
        diagramDocument.documentElement.getAttribute("content")
      );
    }

    return false;
  }
}
