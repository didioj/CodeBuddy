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


  editDistance(s1, s2)
  {
    //make new 2d array
    var d = new Array(s2.length+1);
    for (i = 0; i < d.length; i++)
    {
      d[i] = new Array(s1.length+1)
      for (j = 0; j < s1.length+1; j++)
      {
        d[i][j] = 0; //set everything to zero
      }
    }
    var m = s1.length
    var n = s2.length

    //first row and first column simply count up
    for (let i = 0; i <= m; i ++)
    {
      d[0][i] = i;
    }
    for (let j = 0; j <= n; j++)
    {
      d[j][0] = j;
    }
    var cost = 0
    for (let j = 1; j <= n; j++) {
      for (let i = 1; i <= m; i++) {
      if (s1[i - 1] == s2[j - 1])
        cost = 0
      else
        cost = 1
      //In order: deletion, insertion, substitution
      d[j][i] = Math.min(d[j][i - 1] + 1, d[j - 1][i] + 1, d[j - 1][i - 1] + cost );
      }
    }
    return d[n][m]
  },

  search(selection) {
    //this function needs to look up a relevant algorithm and return it
    //so search for the label and return all the text following it until the next label

    editor = atom.workspace.getActivePaneItem()
    file = editor.buffer.file
    filePath = file.path

    //confirming the file in the active pane is a .py
    if (filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'y')
    {
      var distances = new Map();
      for (let [k, v] of pythonAlgos) //key is name of algo, value is edit distance
      {
        distances.set(k, this.editDistance(selection, k)) //fill up map with edit distances
      }
      //then return lowest edit distance
      var lowestDist = Number.MAX_SAFE_INTEGER
      var lowestName = ""
      for (let [k, v] of distances) //key is name of algo, v is edit distance
      {
        if (v < lowestDist)
        {
          lowestDist = v
          lowestName = k
        }
      }
      return pythonAlgos.get(lowestName)
    }

    //checking if the file in the active pane is a .cpp
    if (filePath.charAt(filePath.length-3) == 'c' && filePath.charAt(filePath.length-2) == 'p' && filePath.charAt(filePath.length-1) == 'p')
    {
      var distances = new Map();
      for (let [k, v] of cppAlgos) //key is name of algo, val is edit distance
      {
        distances.set(k, this.editDistance(selection, k)) //fill up map with edit distances
      }
      //then return lowest edit distance
      var lowestDist = Number.MAX_SAFE_INTEGER
      var lowestName = ""
      for (let [k, v] of distances) //key is name of algo, v is edit distance
      {
        if (v < lowestDist)
        {
          lowestDist = v
          lowestName = k
        }
      }
      return cppAlgos.get(lowestName)
    }

  }

};
