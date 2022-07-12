const allSVGs = document.getElementsByTagName("svg");

window.addEventListener("load", sizing);
window.addEventListener("resize", sizing);

function sizing() {
  for (const svg of allSVGs) {
    svg.setAttribute("width", svg.getBoundingClientRect().width);
    svg.setAttribute("height", svg.getBoundingClientRect().height);

    // extra space around normal view box size
    svg.setAttribute(
      "viewBox",
      `${-svg.getBoundingClientRect().width / 2} ${
        -svg.getBoundingClientRect().height / 2
      } ${svg.getBoundingClientRect().width * 2} ${
        svg.getBoundingClientRect().height * 2
      }`
    );
  }
}

window.addEventListener("load", utils);

// https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Pinch_zoom_gestures
// https://css-tricks.com/creating-a-panning-effect-for-svg/
function utils() {
  for (const svg of allSVGs) {
    if (window.PointerEvent) {
      svg.addEventListener("pointerdown", onPointerDown);
      svg.addEventListener("pointerup", onPointerUp);
      svg.addEventListener("pointerleave", onPointerUp);
      svg.addEventListener("pointermove", onPointerMove);
    } else {
      svg.addEventListener("mousedown", onPointerDown);
      svg.addEventListener("mouseup", onPointerUp);
      svg.addEventListener("mouseleave", onPointerUp);
      svg.addEventListener("mousemove", onPointerMove);

      svg.addEventListener("touchstart", onPointerDown);
      svg.addEventListener("touchend", onPointerUp);
      svg.addEventListener("touchmove", onPointerMove);
    }

    const evCache = [];
    let prevDiff = -1;

    const point = svg.createSVGPoint();

    function getPointFromEvent(event) {
      if (event.targetTouches) {
        point.x = event.targetTouches[0].clientX;
        point.y = event.targetTouches[0].clientY;
      } else {
        point.x = event.clientX;
        point.y = event.clientY;
      }

      const invertedSVGMatrix = svg.getScreenCTM().inverse();

      return point.matrixTransform(invertedSVGMatrix);
    }

    let isPointerDown = false;

    let pointerOrigin;

    function onPointerDown(event) {
      evCache.push(event);

      isPointerDown = true;

      pointerOrigin = getPointFromEvent(event);
    }

    const viewBox = svg.viewBox.baseVal;

    function onPointerMove(event) {
      // Find this event in the cache and update its record with this event
      for (var i = 0; i < evCache.length; i++) {
        if (event.pointerId == evCache[i].pointerId) {
          evCache[i] = event;
          break;
        }
      }

      // If two pointers are down, check for pinch gestures
      if (evCache.length == 2) {
        // Calculate the distance between the two pointers
        var curDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);

        if (prevDiff > 0) {
          if (curDiff > prevDiff) {
            // The distance between the two pointers has increased
            const mx = event.offsetX;
            const my = event.offsetY;
            const dw = curDiff - prevDiff;
            const dh = curDiff - prevDiff;
            const dx = (dw * mx) / svg.clientWidth;
            const dy = (dh * my) / svg.clientHeight;
            viewBox.x += dx;
            viewBox.y += dy;
            viewBox.width -= dw;
            viewBox.height -= dh;
          }
          if (curDiff < prevDiff) {
            // The distance between the two pointers has decreased
            const mx = event.offsetX;
            const my = event.offsetY;
            const dw = curDiff - prevDiff;
            const dh = curDiff - prevDiff;
            const dx = (dw * mx) / svg.clientWidth;
            const dy = (dh * my) / svg.clientHeight;
            viewBox.x += dx;
            viewBox.y += dy;
            viewBox.width -= dw;
            viewBox.height -= dh;
          }
        }

        // Cache the distance for the next move event
        prevDiff = curDiff;
      } else {
        if (!isPointerDown) {
          return;
        }

        event.preventDefault();

        const pointerPosition = getPointFromEvent(event);

        viewBox.x -= pointerPosition.x - pointerOrigin.x;
        viewBox.y -= pointerPosition.y - pointerOrigin.y;
      }
    }

    function onPointerUp(event) {
      remove_event(event);

      // If the number of pointers down is less than two then reset diff tracker
      if (evCache.length < 2) {
        prevDiff = -1;
      }

      isPointerDown = false;
    }

    function remove_event(event) {
      // Remove this event from the target's cache
      for (var i = 0; i < evCache.length; i++) {
        if (evCache[i].pointerId == event.pointerId) {
          evCache.splice(i, 1);
          break;
        }
      }
    }

    // https://stackoverflow.com/a/52640900
    svg.onwheel = scrollZoom;

    function scrollZoom(event) {
      event.preventDefault();
      const w = viewBox.width;
      const h = viewBox.height;
      const mx = event.offsetX;
      const my = event.offsetY;
      const dw = w * -Math.sign(event.deltaY) * 0.05;
      const dh = h * -Math.sign(event.deltaY) * 0.05;
      const dx = (dw * mx) / svg.clientWidth;
      const dy = (dh * my) / svg.clientHeight;
      viewBox.x += dx;
      viewBox.y += dy;
      viewBox.width -= dw;
      viewBox.height -= dh;
    }
  }
}
