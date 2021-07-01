const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');

const TQ = document.getElementById('TQ');
const main = document.getElementById('main');
const createQForm = document.getElementById('create-question');

createQForm.onsubmit = addQHandler;
main.onsubmit = generateHandler;

addQuestion('It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', ['a', 'b', 'c'])
addQuestion('It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', ['a', 'b', 'c'])
addQuestion('hello world?', ['asdasdasdsadsaa', 'b', 'c'])
addQuestion('It is a lonaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).', ['a', 'b', 'c'])


function addQuestion(questionContent, choiceContents) {
  let TQClone = TQ.content.firstElementChild.cloneNode(true);
  let buttonTop = TQClone.querySelector('.up');
  let buttonBottom = TQClone.querySelector('.bottom');
  let question = TQClone.querySelector('.question') 
  let choices = TQClone.querySelectorAll('.q-choice');
  let answersInput = TQClone.querySelectorAll('.answer');
  let close = TQClone.querySelector('.close');
  let name = `choice-${main.childElementCount}`;

  buttonTop.onclick = () => moveTop(TQClone);
  buttonBottom.onclick = () => moveBottom(TQClone);
  close.onclick = function() { this.parentNode.remove(); };

  question.textContent = questionContent;
  choices.forEach((choice, index) => {
    choice.textContent = choiceContents[index];
    answersInput[index].value = choiceContents[index];
    // Name Mangling for each choices
    choice.parentNode.firstElementChild.setAttribute('name', name);
  });


  main.appendChild(TQClone);
}

function addQHandler(e) {
  e.preventDefault();

  let data = new FormData(createQForm);

  let question = data.get('question');
  let answerList = data.getAll('answer');

  addQuestion(question, answerList);
}

function generateHandler(e) {
  e.preventDefault();
  if(main.childElementCount) {
    let data = new FormData(main);
    let answers = Array.from(data.values());
  } else {
    alert('You need to have atleast one question!');
  }
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
