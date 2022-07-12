const revealableItems = document
  .getElementById("reveal-container")
  .querySelectorAll("span");

// if the device has a pointer have a circle follow the mouse
if (matchMedia("(pointer:fine)").matches) {
  // the circle
  const cursor = document.getElementById("reveal-cursor");
  const container = document.getElementById("reveal-container");
  const header = document.getElementById("sticky-header");
  const hero = document.getElementById("code-rain-container");
  let cursorRadius = cursor.getBoundingClientRect().height / 2;
  let heroHeight = hero.getBoundingClientRect().height;

  function reset() {
    cursorRadius = cursor.getBoundingClientRect().height / 2;
    heroHeight = hero.getBoundingClientRect().height;
  }

  window.addEventListener("load", reset);
  window.addEventListener("resize", reset);

  let mouseX, mouseY;
  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // only display cursor in the important area
    if (
      /*
      compares mouse position to the cursors radius
      and the offset from the start of the page
      */
      e.pageY >
        cursorRadius + heroHeight + header.getBoundingClientRect().height &&
      e.pageY <
        2 * cursorRadius + heroHeight + container.getBoundingClientRect().height
    ) {
      cursor.style.opacity = "1";
      cursor.style.filter = "blur(5px)";
    } else {
      cursor.style.opacity = "0";
      cursor.style.filter = "blur(25px)";
    }
  });

  // also check for cursor the cursor on scroll
  document.addEventListener("scroll", function () {
    if (
      mouseY + window.scrollY >
        cursorRadius + heroHeight + header.getBoundingClientRect().height &&
      mouseY + window.scrollY <
        2 * cursorRadius + heroHeight + container.getBoundingClientRect().height
    ) {
      cursor.style.opacity = "1";
      cursor.style.filter = "blur(5px)";
    } else {
      cursor.style.opacity = "0";
      cursor.style.filter = "blur(25px)";
    }
  });

  // cursor follows mouse with a slight delay
  let currentX, currentY, newX, newY;
  let followMouse = () => {
    requestAnimationFrame(followMouse);

    if (!currentX || !currentY) {
      currentX = mouseX;
      currentY = mouseY;
    } else {
      newX = (mouseX - currentX) * 0.125;
      newY = (mouseY - currentY) * 0.125;
      if (Math.abs(newX) + Math.abs(newY) < 0.1) {
        currentX = mouseX;
        currentY = mouseY;
      } else {
        currentX += newX;
        currentY += newY;
      }
    }
    cursor.style.left = currentX + "px";
    cursor.style.top = currentY + "px";
  };

  window.addEventListener("load", followMouse);

  // reveal
  // http://jeffreythompson.org/collision-detection/circle-rect.php
  function intersects(i) {
    const cx = cursor.getBoundingClientRect().left + cursorRadius;
    const cy = cursor.getBoundingClientRect().top + cursorRadius;

    const rx = revealableItems[i].getBoundingClientRect().left;
    const ry = revealableItems[i].getBoundingClientRect().top;
    const rw = revealableItems[i].getBoundingClientRect().width;
    const rh = revealableItems[i].getBoundingClientRect().height;

    let testX = cx;
    let testY = cy;

    if (cx < rx) testX = rx;
    else if (cx > rx + rw) testX = rx + rw;

    if (cy < ry) testY = ry;
    else if (cy > ry + rh) testY = ry + rh;

    const distX = cx - testX;
    const distY = cy - testY;
    const distance = distX * distX + distY * distY;

    if (distance <= cursorRadius * cursorRadius) {
      return true;
    }
    return false;
  }

  // https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf
  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  const converted = [];

  // previous text content
  const store = [];

  for (let i = 0; i < revealableItems.length; i++) {
    converted[i] = false;
    store[i] = revealableItems[i].textContent;
  }

  const interval = [];

  function reveal() {
    for (let i = 0; i < revealableItems.length; i++) {
      if (intersects(i) && !converted[i]) {
        converted[i] = true;

        // convert binary into char
        revealableItems[i].textContent = String.fromCharCode(
          parseInt(revealableItems[i].textContent, 2).toString(10)
        );

        // start interval to check if there is still an intersection
        interval[i] = setInterval(function () {
          if (!intersects(i)) {
            clearInterval(interval[i]);

            // when no intersection is found, it returns to normal after 2.5s
            setTimeout(function () {
              revealableItems[i].textContent = store[i];
              converted[i] = false;
            }, 2500);
          }
        }, 50);
      }
    }

    requestAnimationFrame(reveal);
  }

  container.addEventListener("mousemove", throttle(reveal, 50));
} else {
  // no pointer, so everything just converts on click
  let converted = false;
  document
    .getElementById("reveal-container")
    .addEventListener("click", function () {
      if (!converted) {
        converted = true;
        for (let i = 0; i < revealableItems.length; i++) {
          let store = revealableItems[i].textContent;

          revealableItems[i].textContent = String.fromCharCode(
            parseInt(revealableItems[i].textContent, 2).toString(10)
          );
          setTimeout(function () {
            revealableItems[i].textContent = store;
            converted = false;
          }, 2500);
        }
      }
    });
}
