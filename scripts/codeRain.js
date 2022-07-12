// https://codepen.io/vanillaSlice/pen/dzNVgj
// https://dev.to/javascriptacademy/matrix-raining-code-effect-using-javascript-4hep
const canvas = document.getElementById("code-rain");
const context = canvas.getContext("2d");

window.addEventListener("load", reset);
window.addEventListener("resize", reset);

function reset() {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  rain = initRain();
}

// used for spacing
const fontSize = 16;

// possible chars
const alphabet =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";

let frame = 0;
let rain = initRain();

function draw() {
  // rain leaves a trail
  context.fillStyle = "rgba(14, 14, 14, 0.3)";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // needs to be set each time
  context.font = 1 + `rem "M PLUS 1 Code", "Courier New", monospace`;
  context.textAlign = "center";

  rain.draw();

  requestAnimationFrame(draw);
}

// start
draw();

// all raindrops
function initRain() {
  const rain = [];

  // every other possible column
  for (let i = 0; i < canvas.width / fontSize; i += 2) {
    const x = i * fontSize;

    // start out of frame
    const y = Math.floor(Math.random() * 1000 - 1000);

    // abitrary speed
    const speed = Math.floor(Math.random() * 4 + 3);

    // raindrop at least 6 chars long, up to screen height
    const length = Math.floor(
      Math.random() * (canvas.height / fontSize - 6) + 6
    );
    const raindrop = initRaindrop(x, y, speed, length);
    rain.push(raindrop);
  }

  return {
    draw: function () {
      // each raindrops head is white and the tail is colored
      for (let i = 0; i < rain.length; i++) {
        let linearGradient;
        if (rain[i].getFirstCharY() > rain[i].getLastCharY()) {
          // raindrop is not split
          linearGradient = context.createLinearGradient(
            0,
            rain[i].getLastCharY(),
            0,
            rain[i].getFirstCharY() + 4 * fontSize
          );
        } else {
          // raindrop is split
          linearGradient = context.createLinearGradient(
            0,
            0,
            0,
            rain[i].getFirstCharY() + 4 * fontSize
          );
        }

        linearGradient.addColorStop(0, "#e50046");
        linearGradient.addColorStop(0.9, "#FFFFFF");

        // needed if the raindrop is split so that the trailing part is colored
        linearGradient.addColorStop(1, "#e50046");
        context.fillStyle = linearGradient;

        rain[i].draw();

        // used for the changeRate
        frame++;
        if (frame >= 1000) frame = 0;
      }
    },
  };
}

// all characters in a raindrop
function initRaindrop(x, y, speed, length) {
  const chars = [];
  for (let i = 0; i < length; i++) {
    // abitrary change rate
    const changeRate = Math.floor(Math.random() * 20 + 20);
    const char = initChar(x, y, speed, changeRate, length);
    chars.push(char);

    // chars get stacked on top of another
    y -= fontSize;
  }
  return {
    draw: function () {
      for (let i = 0; i < chars.length; i++) {
        chars[i].draw();
      }
    },

    // the head of the raindrop
    getFirstCharY: function () {
      return chars[0].getY();
    },

    // the last char of the fade
    getLastCharY: function () {
      return chars[Math.floor(chars.length / 3) - 1].getY();
    },
  };
}

function initChar(x, y, speed, changeRate, length) {
  let char;
  return {
    draw: function () {
      if (frame % changeRate === 0 || !char) {
        char = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }

      // continue out of view for a bit before resetting to the top
      if (y < canvas.height + (length / 3) * fontSize) {
        y += speed;
      } else {
        y = 0;
      }

      context.fillText(char, x, y);
    },
    getY: function () {
      if (y !== undefined) {
        return y;
      }
    },
  };
}
