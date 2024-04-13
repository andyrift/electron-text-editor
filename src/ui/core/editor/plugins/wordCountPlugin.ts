import { Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import type { Ref } from "vue";

const countWords = (editorView: EditorView) => {
  let paraCount = 0;
  let wordCount = 0;
  Object.keys(editorView.dom.childNodes).forEach((value, key: number) => {
    let maybePara = editorView.dom.children[key];
    if (maybePara.textContent) {
      let tag = maybePara.tagName;
      if (tag == 'p' || tag == 'h1' || tag == 'h2' || tag == 'h3') {
        if (maybePara.textContent.trim().length > 0) paraCount += 1;
      }
      // TODO not only spaces define words but also other characters
      let split = maybePara.textContent.replace(/[ ]{2,}/gi, " ").trim().split(" ");
      if (!(split.length == 1) || !(split[0].length == 0)) wordCount += split.length;
    }
  });
  return paraCount + wordCount;
}

class CounterView {
  editTimeout: NodeJS.Timeout | undefined;
  canWords = true;
  canCharacters = true;
  lastView: EditorView | null = null;
  counter: Ref<{ words: number, characters: number }>;
  constructor(counter: Ref<{ words: number, characters: number }>) {
    this.counter = counter;
  };
  countWords() {
    if (!this.lastView) { return; }
    this.counter.value.words = countWords(this.lastView);
  };
  countCharacters() {
    if (!this.lastView) return;
    let text = this.lastView.dom.textContent;
    this.counter.value.characters = text? text.length : 0;
  };
  update(editorView: EditorView) {
    this.lastView = editorView;
    clearTimeout(this.editTimeout);
    this.editTimeout = setTimeout(() => {
      this.countWords();
      this.countCharacters();
    }, 1000);
    if (this.canWords) {
      this.canWords = false;
      this.countWords();
      setTimeout(() => { this.canWords = true; }, 1000);
    }
    if (this.canCharacters) {
      this.canCharacters = false;
      this.countCharacters();
      setTimeout(() => { this.canCharacters = true; }, 300);
    }
  };
  destroy() {
    console.log("count plugin destroy");
  };
}

export const wordCountPlugin = (counter : Ref<{ words : number, characters : number }>) => {
  return new Plugin({
    view: () => {
      return new CounterView(counter);
    }
  })
}