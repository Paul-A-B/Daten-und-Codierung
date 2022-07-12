// https://levelup.gitconnected.com/how-to-create-a-before-after-image-slider-with-css-and-js-a609d9ba77bf
const slider = document.getElementById("slider");
const sliderImg = document.getElementById("slider-foreground-img");

slider.oninput = (e) => {
  const sliderPos = e.target.value;
  sliderImg.style.clipPath = `inset(0 0 0 ${sliderPos}%)`;
};
