// https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/
// https://www.programiz.com/dsa/huffman-coding
const svg = document.getElementById("huffman-display");
const svgns = "http://www.w3.org/2000/svg";

const textAreaInput = document.getElementById("huffman-input");
const textAreaBinary = document.getElementById("binary-conversion");
const textAreaOutput = document.getElementById("huffman-output");

const statsTable = document.getElementById("huffman-stats");

class HuffmanNode {
  constructor() {
    this.freq = 0;
    this.char = "";
    this.left = this.right = null;
  }
}

// https://www.baeldung.com/cs/binary-tree-height
function BTHeight(root) {
  if (!root) {
    return 0;
  }
  const leftHeight = BTHeight(root.left);
  const rightHeight = BTHeight(root.right);
  return Math.max(leftHeight, rightHeight) + 1;
}

let shouldRotate;
let aspectRatio = 0;

function reset() {
  // only redraw if there is a significant change in aspect ratio
  if (
    aspectRatio.toFixed(1) !== (svg.clientWidth / svg.clientHeight).toFixed(1)
  ) {
    aspectRatio = svg.clientWidth / svg.clientHeight;

    // rotate display on small devices
    if (window.innerWidth < 600) {
      shouldRotate = true;
    } else {
      shouldRotate = false;
    }

    draw();
  }
}

function draw() {
  // remove previous tree
  svg.textContent = "";

  huffman();

  // recenter the view
  svg.setAttribute(
    "viewBox",
    `${-svg.getBoundingClientRect().width / 2} ${
      -svg.getBoundingClientRect().height / 2
    } ${svg.getBoundingClientRect().width * 2} ${
      svg.getBoundingClientRect().height * 2
    }`
  );

  if (shouldRotate) {
    svg.style.transform = "rotate(-90deg)";
    const textElements = svg.getElementsByTagName("text");

    // adjust text rotation
    for (let i = 0; i < textElements.length; i++) {
      textElements[i].style.writingMode = "vertical-lr";
    }
  } else {
    svg.style.transform = "rotate(0deg)";
  }
}

window.addEventListener("load", reset);
window.addEventListener("resize", reset);

textAreaInput.addEventListener("input", draw);

function huffman() {
  if (textAreaInput.value) {
    const chars = [];

    // get all characters used
    textAreaInput.value.split("").forEach((el) => {
      if (!chars.includes(el)) {
        chars.push(el);
      }
    });

    const charFrequency = [];

    // get their frequencies
    for (let c of textAreaInput.value) {
      if (charFrequency[chars.indexOf(c)]) {
        charFrequency[chars.indexOf(c)]++;
      } else {
        charFrequency[chars.indexOf(c)] = 1;
      }
    }

    // relate characters to their frequencies
    const huffmanData = [];
    for (let i = 0; i < chars.length; i++) {
      huffmanData.push({ char: chars[i], freq: charFrequency[i] });
    }

    // sort characters from lowest frequency to highest
    huffmanData.sort((a, b) => {
      return a.freq - b.freq;
    });

    // ordered nodes
    const priorityQueue = [];

    // turn data into nodes
    for (let i = 0; i < huffmanData.length; i++) {
      const leafNode = new HuffmanNode();
      leafNode.char = huffmanData[i].char;
      leafNode.freq = huffmanData[i].freq;
      priorityQueue.push(leafNode);
    }

    // construct max heap
    while (priorityQueue.length > 1) {
      // make new node with two lowest frequencies as chidlren
      const parentNode = new HuffmanNode();
      parentNode.left = priorityQueue.shift();
      parentNode.right = priorityQueue.shift();
      parentNode.freq = parentNode.left.freq + parentNode.right.freq;
      priorityQueue.push(parentNode);
      priorityQueue.sort((a, b) => {
        return a.freq - b.freq;
      });
    }

    const huffmanTreeHeight = BTHeight(priorityQueue[0]);

    const huffmanTree = {
      data: huffmanData,
      height: huffmanTreeHeight,
    };

    drawHuffmanTree(
      huffmanTree,
      priorityQueue[0],
      "",
      1,
      svg.clientWidth / 2,
      svg.clientHeight / (2 + huffmanTreeHeight)
    );

    textAreaOutput.value = textAreaInput.value;

    // show input as huffman code
    for (let i = 0; i < huffmanData.length; i++) {
      textAreaOutput.value = textAreaOutput.value.replaceAll(
        huffmanData[i].char,
        huffmanData[i].code + " "
      );
    }

    textAreaBinary.value = "";

    // show input as binary
    for (let i = 0; i < textAreaInput.value.length; i++) {
      textAreaBinary.value = textAreaBinary.value.concat(
        textAreaInput.value.charCodeAt(i).toString(2) + " "
      );
    }

    // remove previous stats
    while (statsTable.rows.length > 1) {
      statsTable.deleteRow(-1);
    }

    // approximate memory use
    let freqMemory = 0,
      encodedMemory = 0;

    // information on each entry
    for (let i = 0; i < huffmanData.length; i++) {
      const row = statsTable.insertRow(-1);

      const charCell = row.insertCell(-1);
      charCell.textContent = huffmanData[i].char;

      const freqCell = row.insertCell(-1);
      freqCell.textContent = huffmanData[i].freq;

      // min amount of bits needed to store the number
      freqMemory += Math.ceil(Math.log2(huffmanData[i].freq + 1));

      const codeCell = row.insertCell(-1);
      codeCell.textContent = huffmanData[i].code;

      const memoryCell = row.insertCell(-1);
      memoryCell.textContent = `${huffmanData[i].freq} * ${
        huffmanData[i].code.length
      } = ${huffmanData[i].freq * huffmanData[i].code.length} bit`;
      encodedMemory += huffmanData[i].freq * huffmanData[i].code.length;
    }

    const summaryRow = statsTable.insertRow(-1);

    // memory needed to store each char
    const charCell = summaryRow.insertCell(-1);
    charCell.textContent = `${huffmanData.length} * 8 = ${
      huffmanData.length * 8
    } bit`;

    // memory needed to store each freq
    const freqCell = summaryRow.insertCell(-1);
    freqCell.textContent = `${freqMemory} bit`;

    const codeCell = summaryRow.insertCell(-1);
    codeCell.textContent = "/";

    // memory needed to store the actual data
    const memoryCell = summaryRow.insertCell(-1);
    memoryCell.textContent = `${encodedMemory} bit`;

    const comparisonRow = statsTable.insertRow(-1);

    const comparisonCell = comparisonRow.insertCell(-1);
    comparisonCell.textContent = `Insgesamt hat es ${
      huffmanData.length * 8 + freqMemory + encodedMemory
    } bit gebraucht. Ohne Huffman Codierung hätte es
    ${textAreaInput.value.length * 8} bit gebraucht.
    Es braucht ${
      Math.round(
        ((huffmanData.length * 8 + freqMemory + encodedMemory) /
          (textAreaInput.value.length * 8)) *
          10000
      ) / 100
    }% so viele bits.`;
    comparisonCell.colSpan = 4;
  }
}

// recursively draw binary tree
function drawHuffmanTree(huffmanTree, node, huffmanCode, depth, x, y) {
  const size = svg.clientHeight / (2 ** depth + huffmanTree.height);
  const xSpacing = svg.clientWidth / (2 ** depth * aspectRatio);
  const ySpacing = (2 * svg.clientHeight) / (2 ** depth + huffmanTree.height);

  // leaf node has it's code behind it
  if (!(node.left && node.right)) {
    let code;
    if (shouldRotate) {
      code = createText(huffmanCode, 3 * size, x, y, 0, 2 * size);
    } else {
      code = createText(huffmanCode, 3 * size, x, y, 0, 1.5 * size);
    }
    svg.appendChild(code);

    // adds the huffman code to the data set
    key = Object.keys(huffmanTree.data).filter((key) => {
      return huffmanTree.data[key].char == node.char;
    });
    huffmanTree.data[key].code = huffmanCode;
  }

  /*
  connects to it's child, displays the code fragment
  that corresponds to the path and recurses
  */
  if (node.left) {
    const connectingLine = createLine(x, y, -xSpacing, ySpacing, size / 10);
    svg.appendChild(connectingLine);

    const pathCode = createText(0, 2 * size, x, y, -1.5 * size, 0);

    svg.appendChild(pathCode);

    drawHuffmanTree(
      huffmanTree,
      node.left,
      huffmanCode + "0",
      depth + 1,
      x - xSpacing,
      y + ySpacing
    );
  }
  if (node.right) {
    const connectingLine = createLine(x, y, xSpacing, ySpacing, size / 10);
    svg.appendChild(connectingLine);

    const pathCode = createText(1, 2 * size, x, y, 1.5 * size, 0);

    svg.appendChild(pathCode);

    drawHuffmanTree(
      huffmanTree,
      node.right,
      huffmanCode + "1",
      depth + 1,
      x + xSpacing,
      y + ySpacing
    );
  }

  // backdrop for the text
  const circle = createCircle(x, y, size);
  svg.appendChild(circle);

  // adds frequency || char data
  if (node.char) {
    let char;
    if (shouldRotate) {
      char = createText(`"${node.char}"`, 2 * size, x, y, size / 2, 0);
    } else {
      char = createText(`"${node.char}"`, 2 * size, x, y, 0, -size / 2);
    }
    svg.appendChild(char);

    let freq;
    if (shouldRotate) {
      freq = createText(node.freq, 2 * size, x, y, -size / 2, 0);
    } else {
      freq = createText(node.freq, 2 * size, x, y, 0, size / 2);
    }
    svg.appendChild(freq);
  } else {
    const freq = createText(node.freq, 3 * size, x, y, 0, 0);
    svg.appendChild(freq);
  }
}

function createLine(x, y, xSpacing, ySpacing, size) {
  const line = document.createElementNS(svgns, "line");
  line.setAttribute("x1", x);
  line.setAttribute("y1", y);
  line.setAttribute("x2", x + xSpacing);
  line.setAttribute("y2", y + ySpacing);
  line.setAttribute("stroke-width", size);
  line.setAttribute("stroke", "rgb(var(--color-secondary-light))");

  return line;
}

function createCircle(x, y, size) {
  const circle = document.createElementNS(svgns, "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", size);

  return circle;
}

function createText(content, size, x, y, xOffset, yOffset) {
  const text = document.createElementNS(svgns, "text");
  text.textContent = content;
  text.style.fontSize = `${size / (text.textContent.length + 1)}px`;
  text.setAttribute("x", x + xOffset);
  text.setAttribute("y", y + yOffset);

  return text;
}
