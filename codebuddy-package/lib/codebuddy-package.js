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

    // Make C++ algorithms map
      cppalgos = this.build_map("/algos_cpp.txt")
      pythonalgos = this.build_map("/algos_py.txt")
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

  build_map(fileextension)  {
    var algos = new Map();
    const fs = require('fs')
    var fileContents = fs.readFileSync(__dirname+fileextension, 'utf8');
    var lines = fileContents.split('\n');
    var algorithm = "";
    var name = "";
    for(i = 0; i < lines.length; i++){
      if(lines[i].charAt(0) === "~")
      {
        if (name !== "")
        {
          name = name.trim();
          algos.set(name, algorithm)
        }
        name = lines[i].substring(1, lines[i].length)
        algorithm = "";
      }
      else
      {
        algorithm = algorithm + lines[i] +'\n'
      }
    }

    if (name !== "")
    {
      name = name.trim();
      algos.set(name, algorithm)
    }
    return algos
  },

  substitute() {
    console.log('Fetching code');
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText(); //this is the highlighted string
      if (selection.length != 0)
      {
        selection = selection.toLowerCase().trim();
        let codeTemplate = this.search(selection)
        if (codeTemplate !== undefined)
        {
          editor.insertText(codeTemplate)
        }
      }
   }
    //return (this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show());
  },

  search(selection) {
    //this function needs to look up a relevant algorithm and return it
    //possible method: have a txt file with each algorithm labeled,
    //then search for the label and return all the text following it until the next label
    //if the "selection" matches a certain regular expression, then we can search for it

    editor = atom.workspace.getActivePaneItem()
    file = editor.buffer.file
    filePath = file.path

    //confirming the file in the active pane is a .py
    if (filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'y')
    {
      return pythonalgos.get(selection)
    }

    //checking if the file in the active pane is a .cpp
    if (filePath.charAt(filePath.length-3) == 'c' && filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'p')
    {
      return cppalgos.get(selection)
    }
  }

};
