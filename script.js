function strNoAccent(a) {
  return a.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

let motRandom = "";
let userInput = document.getElementById("userInput");
let clue = document.getElementById("clue");
let h2 = document.getElementById("victory");
let replayButton = document.getElementById("replayButton");
let solution = document.getElementById("solution");
let solutionLine = document.getElementById("solutionLine");
let firstLetterSwitch = document.getElementById('switch');
let maxAttempt = 6;
let ligneActuelle = 0;
let saisie = "";
let gameState = false;
let showLetter = false;
let toggle = document.getElementById("toggleClue")

userInput.focus();

userInput.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
  }
});

replayButton.addEventListener("click", function (event) {
  location.reload();
});

clue.addEventListener("click", function () {
  this.classList.add("reveal");
});

solutionLine.style.display = 'none';

async function displayRandomWord() {
  const response = await fetch("https://trouve-mot.fr/api/random/1");
  const words = await response.json();
  categorie = words[0].categorie;
  motRandom = words[0].name.toLowerCase();

  clue.textContent = categorie;
  userInput.setAttribute("maxlength", motRandom.length);
  solution.innerHTML = `${motRandom.toUpperCase()}`
  grille(motRandom);
  console.log(motRandom);
  return motRandom;
}

displayRandomWord();

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    saisie = strNoAccent(this.value.trim().toLowerCase());

    if ((saisie != null) & (saisie != "")) {
      displayWordInGrid(saisie, strNoAccent(motRandom));
    }

    this.value = "";
  }
});

function showFirstLetter() {

  const cell = document.querySelector(
    `.cell[data-row="${ligneActuelle}"][data-col="0"]`
  );

  if(!cell) return;

  if (toggle.checked) {
    cell.textContent = motRandom[0].toUpperCase();
  }
  else{
    cell.textContent = "";
  }
}

toggle.addEventListener("change", function() {
  showFirstLetter()
})

function grille(mot) {
  let wordLength = mot.length;

  const grille = document.getElementById("grille");

  for (let i = 0; i < maxAttempt; i++) {
    const ligne = document.createElement("div");
    ligne.classList.add("row");
    ligne.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;

    for (let j = 0; j < wordLength; j++) {
      const cellule = document.createElement("div");
      cellule.classList.add("cell");
      cellule.setAttribute("data-row", i);
      cellule.setAttribute("data-col", j);
      ligne.appendChild(cellule);
    }
    grille.appendChild(ligne);
    showFirstLetter();
  }
}

function displayWordInGrid(saisie, motRandom) {
  if (gameState) return;
  if (saisie.length != motRandom.length) return;
  if (ligneActuelle >= maxAttempt) return;

  const letterState = new Array(saisie.length).fill("absent");
  const usedLetter = new Array(motRandom.length).fill(false);

  for (let i = 0; i < saisie.length; i++) {
    if (saisie[i] === motRandom[i]) {
      letterState[i] = "correct";
      usedLetter[i] = true;
    }
  }

  for (let i = 0; i < saisie.length; i++) {
    if (letterState[i] === "correct") continue;

    for (let j = 0; j < motRandom.length; j++) {
      if (!usedLetter[j] && saisie[i] === motRandom[j]) {
        letterState[i] = "mal_place";
        usedLetter[j] = true;
        break;
      }
    }
  }

  for (let i = 0; i < saisie.length; i++) {
    setTimeout(() => {
      let lettre = saisie[i];
      const cell = document.querySelector(
        `.cell[data-row="${ligneActuelle}"][data-col="${i}"]`
      );

      if (cell) cell.textContent = lettre.toUpperCase();
      if (!cell) return;

      cell.classList.add("pop");
      setTimeout(() => cell.classList.remove("pop"), 100);

      if (letterState[i] === "correct") {
        cell.style.backgroundColor = "#568D4B";
        cell.style.color = "white";
      } else if (letterState[i] === "mal_place") {
        cell.style.backgroundColor = "#D5BB56";
        cell.style.color = "white";
      } else {
        cell.style.backgroundColor = "gray";
        cell.style.color = "white";
      }
    }, i * 150);
  }

  setTimeout(() => {
    if (ligneActuelle + 1 >= maxAttempt) {
      gameState = true;
      h2.textContent = "Perdu :(";
      h2.style.display = "block";
      userInput.disabled = true;
      userInput.style.display = "none";
      replayButton.style.display = "block";
      solutionLine.style.display = "block"
      firstLetterSwitch.style.display = "none"

      return;
    }

    if (saisie === motRandom) {
      gameState = true;
      h2.textContent = "Gagné!";
      h2.style.display = "block";
      userInput.disabled = true;
      userInput.style.display = "none";
      replayButton.style.display = "block";
      firstLetterSwitch.style.display = "none"

      return;
    }
    ligneActuelle++;
    showFirstLetter();
  }, saisie.length * 150);
}
