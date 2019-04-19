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
    cppAlgos = this.buildMap("/algos_cpp.txt")
    // Make python algorithms map
    pythonAlgos = this.buildMap("/algos_py.txt")
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


  //this function is called in activate to traverse
  //the list of stored algorithms and put them in a
  //map for efficient retrieval. fileextension contains
  //the name of the input file
  buildMap(fileExtension)  {
    //this map will hold algorithm names as keys and their bodies
    //as values
    var algos = new Map();
    const fs = require('fs')
    var fileContents = fs.readFileSync(__dirname+fileExtension, 'utf8');
    var lines = fileContents.split('\n');
    var algorithm = "";
    var name = "";
    //iterate over lines in order to collect one algorithm
    //at a time and add it to algos
    for(i = 0; i < lines.length; i++){
      //we've reached the start of a new algorithm
      if(lines[i].charAt(0) === "~")
      {
        //if name is not empty, we've finished collecting
        //a previous algorithm, so add it to algos
        if (name !== "")
        {
          name = name.trim();
          algos.set(name, algorithm)
        }
        //otherwise, initialize name, and get ready to collect
        //the algorithm
        name = lines[i].substring(1, lines[i].length)
        algorithm = "";
      }
      //add current line to algorithm 
      else
      {
        algorithm = algorithm + lines[i] +'\n'
      }
    }
    //final pass for adding algorithm
    if (name !== "")
    {
      name = name.trim();
      algos.set(name, algorithm)
    }
    return algos
  },

  //driver function for substituting code, this is what gets
  //called by the user
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
  },

  //helper function for determining if two input
  //strings mostly match
  matchString(userString, mapString)
  {
    /*//if more than 75% of chars in common, we have a match
    matches = 0;
    //iterate over letters of both strings to determine
    for (i = 0; i < userString.length; i++)
    {
      for (j = 0; j < mapString.length; j++)
      {
        if (userString[i] == mapString[j])
        {
          matches++
        }
      }
    }

    //check to see if number of characters matching exceeds
    //75%
    if (matches > (mapString.length*.75))
    {
      return true
    }
    else
    {
      return false
    }*/
    return userString === mapString;

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
      for (let [k, v] of pythonAlgos)
      {
        //call to matchstring
        if (this.matchString(selection, k) == true)
        {
          return pythonAlgos.get(k)
        }
      }
    }

    //checking if the file in the active pane is a .cpp
    if (filePath.charAt(filePath.length-3) == 'c' && filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'p')
    {
      for (let [k, v] of cppAlgos)
      {
        //call to matchstring
        if (this.matchString(selection, k) == true)
        {
          return cppAlgos.get(k)
        }
      }
    }

  }

};