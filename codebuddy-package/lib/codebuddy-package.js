'use babel';

import CodebuddyPackageView from './codebuddy-package-view';
import { CompositeDisposable } from 'atom';

export default {

  codebuddyPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.codebuddyPackageView = new CodebuddyPackageView(state.codebuddyPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.codebuddyPackageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'codebuddy-package:substitute': () => this.substitute()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.codebuddyPackageView.destroy();
  },

  serialize() {
    return {
      codebuddyPackageViewState: this.codebuddyPackageView.serialize()
    };
  },

  substitute() {
    console.log('Fetching code');
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText() //this is the highlighted string
      if (selection.length != 0)
      {
        let codeTemplate = this.search(selection)
        editor.insertText(codeTemplate)
      }
   }
    //return (this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show());
  },

  search(selection) {
    var mymap = new Map([["text", "REPLACED"]]);
    return mymap.get("text");
    //this function needs to look up a relevant algorithm and return it
    //possible method: have a txt file with each algorithm labeled,
    //then search for the label and return all the text following it until the next label
    //if the "selection" matches a certain regular expression, then we can search for it
    //return ("REPLACED");
  }

};
