const offset = document.getElementById("caesar-cipher-offset");
const inputElement = document.getElementById("caesar-cipher-input");
const output = document.getElementById("caesar-cipher-output");

offset.addEventListener("input", onInput);
inputElement.addEventListener("input", onInput);
output.addEventListener("input", onInput);

// init example
window.addEventListener("load", onInput);

const alphabetStart = "A".charCodeAt(0);
const letter = /[a-z]/i;

function onInput() {
  try {
    output.textContent = cipher(
      inputElement.value || inputElement.placeholder,
      determineOffset(offset.value || offset.placeholder)
    );
  } catch (e) {
    output.textContent = e.message;
  }
}

// position as an offset from the start of the alphabet
function determineOffset(endChar) {
  if (endChar.match(letter)) {
    return endChar.toUpperCase().charCodeAt(0) - alphabetStart;
  } else {
    throw new Error("A kann nur zu einem anderen Buchstaben werden!");
  }
}

function cipher(input, inputOffset) {
  // turn string into char array
  input = input.toUpperCase().split("");

  // for each char
  for (let i = 0; i < input.length; i++) {
    // everything not a letter is ignored
    if (input[i].match(letter)) {
      // original char position relative to the start of the alphabet
      const oldCharOffset = determineOffset(input[i]);
      const newCharOffset = (oldCharOffset + inputOffset) % 26;

      input[i] = String.fromCharCode(alphabetStart + newCharOffset);
    }
  }

  // combine char array to string again
  return input.join("");
}
