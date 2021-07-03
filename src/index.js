const dbName = "surgen";
const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');
const JSZip = require('jszip');
const zip = new JSZip();
const TQ = document.getElementById('TQ');
const main = document.getElementById('main');
const createQForm = document.getElementById('create-question');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const header = ['Query', 'Answer'];

var generation = 0;
var requestdb = window.indexedDB.open(dbName, 5); 
var db = null;

requestdb.onerror = function(event) {
  alert(`Database error: ${event.target.errorCode}`);
  db = null;
};

requestdb.onsuccess = function(event) {
  db = event.target.result;
  let trans = db.transaction(['queries'], 'readonly');
  let queriesStore = trans.objectStore('queries');
  let req = queriesStore.openCursor();
  let queries = [];

  req.onsuccess = (e) => {
    let cursor = e.target.result;
    if (cursor != null) {
      queries.push(cursor.value);
      cursor.continue();
    } else {
      let fragment = document.createDocumentFragment();
      queries.forEach(q => {
        addQuestion(fragment, q.questionContent, q.choiceContents);
      });
      main.append(...fragment.childNodes);
      console.log('info: cursor fetched all!');
    }
  }
  
  db.onerror = (e) => {
    alert(e.target.errorCode);
  };
};

requestdb.onupgradeneeded = function(event) {
  db = event.target.result; 
  let queries = db.objectStoreNames.contains('queries') ? requestdb.transaction.objectStore('queries') : db.createObjectStore('queries', {autoIncrement: true});
};

createQForm.onsubmit = addQHandler;
main.onsubmit = onSubmit;
generateBtn.onclick = generateHandler;
saveBtn.onclick = saveHandle;

function insertQuery(db, questionContent, choiceContents) {
  if (db) {
    let trans = db.transaction(['queries'], 'readwrite');
    let store = trans.objectStore('queries');
    let query = {questionContent, choiceContents};
    store.add(query);
    trans.oncomplete = () => console.log('info: query added to db');
  }
}

function addQuestion(hostElement, questionContent, choiceContents) {
  let TQClone = TQ.content.firstElementChild.cloneNode(true);
  let buttonTop = TQClone.querySelector('.up');
  let buttonBottom = TQClone.querySelector('.bottom');
  let question = TQClone.querySelector('.question') 
  let query = TQClone.querySelector('.q-query');
  let qIndexes = TQClone.querySelectorAll('.q-index');
  let choices = TQClone.querySelectorAll('.q-choice');
  let answersInput = TQClone.querySelectorAll('.answer');
  let close = TQClone.querySelector('.close');
  let idx = main.childElementCount;
  let choiceName = `choice-${idx}`;

  TQClone.setAttribute('data-idx', idx);
  buttonTop.onclick = () => moveTop(TQClone);
  buttonBottom.onclick = () => moveBottom(TQClone);
  close.onclick = function() { this.parentNode.remove() };

  question.textContent = questionContent;
  query.value = questionContent;

  choices.forEach((choice, index) => {
    choice.textContent = choiceContents[index];
    answersInput[index].value = `${qIndexes[index].textContent}. ${choiceContents[index]}`;
    // Name Mangling for each choices
    choice.parentNode.firstElementChild.setAttribute('name', choiceName);
  });

  hostElement.appendChild(TQClone);
}

function addQHandler(e) {
  e.preventDefault();

  let data = new FormData(createQForm);

  let question = data.get('question');
  let answerList = data.getAll('answer');

  addQuestion(main, question, answerList);
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
  let sibling = element.previousElementSibling;
  if(sibling) 
    sibling.before(element);
  
}

function moveBottom(element) {
  let sibling = element.nextElementSibling;
  if(sibling) 
    sibling.after(element);
}

function extractMain() {
  let queries = [];
  main.childNodes.forEach(e => {
    let questionContent = e.querySelector('.question').textContent;
    let answerNodes = e.querySelectorAll('.answer');
    let choiceContents = [];
    answerNodes.forEach((answer) => choiceContents.push(answer.value.slice(3)));
    queries.push({questionContent, choiceContents});
  });
  return queries;
}

function clearData(storeName) {
  return new Promise((resolve, reject) => {
    let trans = db.transaction([storeName], 'readwrite');
    let queriesStore = trans.objectStore(storeName);
    let req = queriesStore.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject();
  });
}

async function saveHandle() {
  await clearData('queries');
  for (const {questionContent, choiceContents} of extractMain()) 
    insertQuery(db, questionContent, choiceContents);
  

  alert('Data Saved!');
}
