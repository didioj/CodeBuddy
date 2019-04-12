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
      // return ("FOUND PY")
      fileContents = ""
      const fs = require('fs')
      fs.readFile('./lib/algos_py.txt', (err, data) => {
        if (err) throw err;
        // console.log(data.toString());
        fileContents = data.toString();
      });
      return fileContents;
    }


    //checking if the file in the active pane is a .cpp
    if (filePath.charAt(filePath.length-3) == 'c' && filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'p')
    {
      const fs = require('fs')
      var linestart,lineend
      var foundend = false;
      var fileContents = fs.readFileSync("./lib/algos_cpp.txt", 'utf8');
      var lines = fileContents.split('\n'), i,j;
      for(i = 0; i < lines.length; i++){
        console.log("i is at: " + i)
        if(lines[i].charAt(0) === "~"){
          if(selection === (lines[i].substring(1,lines[i].length))){
            linestart = i;
            console.log("Found a match for " + selection + ", which is " + (lines[i].substring(1,lines[i].length)));
            console.log("Line starts at: " + linestart);
            for(j = i + 1; j < lines.length; j++){
              console.log("j is at: " + j);
              if(lines[j].charAt(0) === "~"){
                foundend = true;
                lineend = j - 1;
                console.log("Line ends at: " + lineend);
                break;
              }
            }
          }
            if(!foundend) lineend = lines.length -1;
        }
      }
      var returnlines = "",m;
      for(m = linestart + 1; m < lineend; m++){
        returnlines = returnlines + lines[m] + "\n";
      }

      console.log(returnlines)
      return (returnlines);
    }

    return ("REPLACED")
  }

};
