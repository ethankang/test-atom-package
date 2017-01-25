/* @flow */

import { Emitter, CompositeDisposable } from 'atom'
import type { Disposable, TextEditor } from 'atom'
import EditorLinter from './editor-linter'

export default class EditorRegistry {
  emitter: Emitter;
  subscriptions: CompositeDisposable;
  editorLinters: Map<TextEditor, EditorLinter>;

  constructor() {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.editorLinters = new Map()

    this.subscriptions.add(this.emitter)
  }
  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      this.createFromTextEditor(textEditor)
    }))
  }
  get(textEditor: TextEditor): ?EditorLinter {
    return this.editorLinters.get(textEditor)
  }
  createFromTextEditor(textEditor: TextEditor): EditorLinter {
    let editorLinter = this.editorLinters.get(textEditor)
    if (editorLinter) {
      return editorLinter
    }
    editorLinter = new EditorLinter(textEditor)
    editorLinter.onDidDestroy(() => {
      this.editorLinters.delete(textEditor)
    })
    this.editorLinters.set(textEditor, editorLinter)
    this.emitter.emit('observe', editorLinter)
    return editorLinter
  }
  observe(callback: ((editorLinter: EditorLinter) => void)): Disposable {
    this.editorLinters.forEach(callback)
    return this.emitter.on('observe', callback)
  }
  dispose() {
    for (const entry of this.editorLinters.values()) {
      entry.dispose()
    }
    this.subscriptions.dispose()
  }
}
