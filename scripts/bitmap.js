function Bitmap(
  type = undefined,
  rowCount = undefined,
  columnCount = undefined,
  maxColorValue = undefined,
  pixelValues = []
) {
  this.type = type;
  this.size = {
    x: rowCount,
    y: columnCount,
  };
  this.maxColorValue = maxColorValue;
  this.pixelValues = pixelValues;
}

// https://stackoverflow.com/a/4492417
function listToMatrix(list, elementsPerSubArray) {
  var matrix = [],
    i,
    k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

const button = document.getElementById("bitmap-button");

// init examples
window.addEventListener("load", () => {
  for (let exampleNumber = 1; exampleNumber <= 3; exampleNumber++) {
    bitmapHandler(`example-p${exampleNumber}`);
  }
});

// init interactive bitmap
button.addEventListener("click", () => {
  try {
    bitmapHandler("interactive");
  } catch (e) {
    displayInputError(e);
  }
});

function bitmapHandler(selector) {
  const input = document.getElementById(`bitmap-input-${selector}`).value;
  const svg = document.getElementById(`bitmap-${selector}`);
  svg.textContent = "";

  const bmp = parseInput(input);
  draw(svg, bmp);
}

// organize input
function parseInput(input) {
  const bmp = new Bitmap();

  const lines = input.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) {
      lines[i] = lines[i].trim().toUpperCase();
    } else {
      // remove empty lines
      lines.splice(i, 1);
    }
  }

  // P1 = schwarz/weiß, P2 = Graustufen, P3 = RGB
  bmp.type = lines.shift();

  if (!bmp.type) throw new Error("Keine Typ angegeben");
  else if (bmp.type !== "P1" && bmp.type !== "P2" && bmp.type !== "P3")
    throw new Error("Angegebener Typ wird nicht unterstützt");

  // specified width/height of the bitmap
  try {
    const dimensions = lines.shift().split(" ");
    bmp.size.x = parseInt(dimensions[0]);
    bmp.size.y = parseInt(dimensions[1]);
  } catch (e) {
    throw new Error("Keine Bildgröße angegeben");
  }

  if (!(bmp.size.x && bmp.size.y)) {
    throw new Error("Bildgröße falsch angegeben");
  }

  if (bmp.type !== "P1") {
    // number of colors in each color channel = maxColorValue + 1
    bmp.maxColorValue = parseInt(lines.shift());

    if (!bmp.maxColorValue) {
      throw new Error("Kein maximaler Farbwert angegeben");
    }
  }

  /*
  gives every value its own index so that
  the formatting has no effect on parsing
  */
  while (lines.length) {
    // gets all numbers (considering sign) in next line
    const line = lines.shift().match(/-?\d+/g);

    for (const colorValue of line) {
      // checks if the value is in the correct range
      if (colorValue <= (bmp.maxColorValue || 1) && colorValue >= 0) {
        bmp.pixelValues.push(parseInt(colorValue));
      } else {
        throw new Error("Falsche Farbwerte angegeben");
      }
    }
  }

  let inputLength;
  if (bmp.type === "P3") {
    inputLength = bmp.pixelValues.length / 3;
  } else {
    inputLength = bmp.pixelValues.length;
  }

  // checks for the right amount of values for the specified image dimensions
  if (inputLength !== bmp.size.x * bmp.size.y)
    throw new Error("Falsche Anzahl an Farbwerten angegeben");

  // groups rgb-values
  if (bmp.type === "P3") {
    bmp.pixelValues = listToMatrix(bmp.pixelValues, 3);
  }

  // groups rows
  bmp.pixelValues = listToMatrix(bmp.pixelValues, bmp.size.x);

  return bmp;
}

const svgns = "http://www.w3.org/2000/svg";
function draw(svg, bmp) {
  for (let row = 0; row < bmp.size.y; row++) {
    for (let column = 0; column < bmp.size.x; column++) {
      const pixel = document.createElementNS(svgns, "rect");

      // take up horizontal space
      const size = svg.clientWidth / bmp.size.x;
      pixel.setAttribute("x", size * column);
      pixel.setAttribute("y", size * row);
      pixel.setAttribute("width", size);
      pixel.setAttribute("height", size);
      pixel.setAttribute("stroke", "black");
      pixel.setAttribute("stroke-width", 3);

      switch (bmp.type) {
        case "P1":
          if (bmp.pixelValues[row][column] === 1)
            pixel.setAttribute("fill", "black");
          else pixel.setAttribute("fill", "white");
          break;
        case "P2":
          const grey = 255 * (bmp.pixelValues[row][column] / bmp.maxColorValue);
          pixel.setAttribute("fill", `rgb(${grey},${grey},${grey})`);
          break;
        case "P3":
          const r = 255 * (bmp.pixelValues[row][column][0] / bmp.maxColorValue);
          const g = 255 * (bmp.pixelValues[row][column][1] / bmp.maxColorValue);
          const b = 255 * (bmp.pixelValues[row][column][2] / bmp.maxColorValue);
          pixel.setAttribute("fill", `rgb(${r},${g},${b})`);
          break;
      }
      svg.appendChild(pixel);
    }
  }
}

let alreadyFired;
function displayInputError(e) {
  if (!alreadyFired) {
    alreadyFired = true;
    const buttonMemory = {
      text: button.textContent,
      clr: button.style.color,
      bgClr: button.style.backgroundColor,
    };

    button.textContent = e.message;
    button.style.color = "rgb(var(--color-text-light))";
    button.style.backgroundColor = "rgb(var(--color-primary-dark))";

    // reset style and content
    setTimeout(() => {
      button.textContent = buttonMemory.text;
      button.style.color = buttonMemory.clr;
      button.style.backgroundColor = buttonMemory.bgClr;
      alreadyFired = false;
    }, 2000);
  }
}
