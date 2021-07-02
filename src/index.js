window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; 
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

const dbName = "surgen";
const requestdb = window.indexedDB.open(dbName, 3); 
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');
const JSZip = require('jszip');
const zip = new JSZip();
const TQ = document.getElementById('TQ');
const main = document.getElementById('main');
const createQForm = document.getElementById('create-question');
const generateBtn = document.getElementById('generateBtn');
const header = ['Query', 'Answer'];

var generation = 0;
var db = null;

requestdb.onerror = function(event) {
  console.error(`Database error: ${event.target.errorCode}`);
};
requestdb.onsuccess = function(event) {
  db = event.target.result;
};

requestdb.onupgradeneeded = function(event) {
  db = event.target.result; 
  var objectStore = db.createObjectStore('queries', {autoIncrement: true});
};

createQForm.onsubmit = addQHandler;
main.onsubmit = onSubmit;
generateBtn.onclick = generateHandler;

//addQuestion('This is a template question', ['Make a new question', 'by filling the form', 'below. :3'])

function insertQuery(db, questionContent, choiceContents) {
  let trans = db.transaction(['queries'], 'readwrite');
  let store = trans.objectStore('queries');

  let query = {questionContent, choiceContents};
  store.add(query);
  trans.oncomplete = function() { console.log('info: query added to db'); }
  trans.onerror = function(event) { alert('error storing query ' + event.target.errorCode);};
}

function addQuestion(questionContent, choiceContents) {
  let TQClone = TQ.content.firstElementChild.cloneNode(true);
  let buttonTop = TQClone.querySelector('.up');
  let buttonBottom = TQClone.querySelector('.bottom');
  let question = TQClone.querySelector('.question') 
  let query = TQClone.querySelector('.q-query');
  let qIndexes = TQClone.querySelectorAll('.q-index');
  let choices = TQClone.querySelectorAll('.q-choice');
  let answersInput = TQClone.querySelectorAll('.answer');
  let close = TQClone.querySelector('.close');

  let choiceName = `choice-${main.childElementCount}`;
  //let questionName = `question-${main.childElementCount}`;

  buttonTop.onclick = () => moveTop(TQClone);
  buttonBottom.onclick = () => moveBottom(TQClone);
  close.onclick = function() { this.parentNode.remove(); };

  question.textContent = questionContent;
  query.value = questionContent;

  choices.forEach((choice, index) => {
    choice.textContent = choiceContents[index];
    answersInput[index].value = `${qIndexes[index].textContent}. ${choiceContents[index]}`;
    // Name Mangling for each choices
    choice.parentNode.firstElementChild.setAttribute('name', choiceName);
  });

  insertQuery(db, questionContent, choiceContents);
  main.appendChild(TQClone);
}

function addQHandler(e) {
  e.preventDefault();

  let data = new FormData(createQForm);

  let question = data.get('question');
  let answerList = data.getAll('answer');

  addQuestion(question, answerList);
}

function randomizeAnswer() {
  let questionWrappers = document.querySelectorAll('.wrapper');
  for(const w of questionWrappers) {
    let answers = w.querySelectorAll('.answer');
    let index = Math.floor(Math.random() * answers.length);
    answers[index].checked = true;
  }
}

function generateHandler() {
  if(main.childElementCount) {
    let amount = parseInt(window.prompt('Generate Amount: ', '0'));

    for(let i = 0; i < amount; ++i) {
      randomizeAnswer();
      main.requestSubmit();
    }
    zip.generateAsync({type: "base64"}).then((URI) => {
      // Link Injection
      let a = document.createElement('a');
      a.href = "data:application/zip;base64,"+URI;
      a.download = "surveys.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  } else {
    alert('You need to have atleast one question!');
  }
}

function onSubmit(e) {
  e.preventDefault();

  let data = new FormData(main);
  let acc = 0;
  let stored = []
  for(const entry of data.values()) {
    if(!(acc % 2)) 
      stored.push([])
    stored[stored.length - 1].push(entry);
    ++acc;
  }

  let csvFile = convertArrayToCSV(stored,{header}); 
  zip.file(`${generation}.csv`, csvFile)
  ++generation;
}

function moveTop(element) {
  let topSibling = element.previousElementSibling;
  if(topSibling)
    topSibling.before(element);
}

function moveBottom(element) {
  let bottomSibling = element.nextElementSibling;
  if(bottomSibling)
    bottomSibling.after(element);
}
