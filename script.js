const photoBaseUrl = "https://pub-987a56d204d3452a898d115639f5bece.r2.dev/images/";

const photos = [
  "A815006-0002.jpg",
  "A815006-0010.jpg",
  "A815006-0015.jpg",
  "A815006-0021.jpg",
  "A815006-0022.jpg",
  "A815006-0033.jpg",
  "A815006-0038.jpg",
  "A815006-0039.jpg",
  "A815006-0041.jpg",
  "A815006-0042.jpg",
  "A815006-0044.jpg",
  "A815006-0046.jpg",
  "A815006-0048.jpg",
  "A815006-0051.jpg",
  "A815006-0052.jpg",
  "A815006-0053.jpg",
  "A815006-0056.jpg",
  "A815006-0065.jpg",
  "A815006-0068.jpg",
  "A815006-0069.jpg",
  "A815006-0076.jpg",
  "A815006-0077.jpg",
  "A815006-0082.jpg",
  "A815006-0088.jpg",
  "A815006-0091.jpg",
  "A815006-0103.jpg",
  "A815006-0110.jpg",
  "A815006-0120.jpg",
  "A815006-0122.jpg",
  "A815006-0125.jpg",
  "A815006-0126.jpg",
  "A815006-0128.jpg",
  "A815006-0129.jpg",
  "A815006-0131.jpg",
  "A815006-0137.jpg",
  "A815006-0141.jpg",
  "A815006-0144.jpg",
  "A815006-0145.jpg",
  "A815006-0147.jpg",
  "A815006-0148.jpg",
  "A815006-0151.jpg",
  "A815006-0157.jpg",
  "A815006-0158.jpg",
  "A815006-0159.jpg",
  "A815006-0160.jpg",
  "A815006-0161.jpg",
  "A815006-0167.jpg",
  "A815006-0171.jpg",
  "A815006-0173.jpg",
  "A815006-0174.jpg",
  "A815006-0178.jpg",
  "A815006-0183.jpg",
  "A815006-0197.jpg",
  "A815006-0199.jpg",
  "A815006-0204.jpg",
  "A815006-0205.jpg",
  "A815006-0213.jpg",
  "A815006-0214.jpg",
  "A815006-0218.jpg",
  "A815006-0232.jpg",
  "164875_0.jpg",
  "164876_0.jpg",
  "164877_0.jpg",
  "164878_0.jpg",
  "164879_0.jpg",
  "164880_0.jpg",
  "164881_0.jpg",
  "164882_0.jpg",
  "164883_0.jpg"
];

const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const viewerImage = document.getElementById("viewer-image");
const viewerCounter = document.getElementById("viewer-counter");
const closeButton = document.getElementById("close-viewer");
const previousButton = document.getElementById("previous-photo");
const nextButton = document.getElementById("next-photo");
const heroImage = document.querySelector(".hero-image");

let currentPhoto = 0;
let previouslyFocusedElement = null;
let touchStartX = 0;
const unavailablePhotos = new Set();
const galleryTiles = new Map();

heroImage.addEventListener("error", () => {
  heroImage.parentElement.hidden = true;
});

photos.forEach((file, index) => {
  const button = document.createElement("button");
  const image = document.createElement("img");
  const number = String(index + 1).padStart(2, "0");

  button.className = "photo-tile";
  button.type = "button";
  button.setAttribute("aria-label", `放大查看第 ${number} 張照片`);
  button.addEventListener("click", () => openPhoto(index));

  image.src = `${photoBaseUrl}${file}`;
  image.alt = `婚紗照片 ${number}`;
  image.loading = index < 8 ? "eager" : "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    markPhotoUnavailable(index);
  });

  button.append(image);
  gallery.append(button);
  galleryTiles.set(index, button);
});

function getAvailablePhotos() {
  return photos
    .map((_, index) => index)
    .filter(index => !unavailablePhotos.has(index));
}

function updateViewer() {
  const availablePhotos = getAvailablePhotos();
  if (availablePhotos.length === 0) {
    closeViewer();
    return;
  }

  if (!availablePhotos.includes(currentPhoto)) {
    currentPhoto = availablePhotos.find(index => index > currentPhoto) ?? availablePhotos[0];
  }

  const number = String(availablePhotos.indexOf(currentPhoto) + 1).padStart(2, "0");
  viewerImage.src = `${photoBaseUrl}${photos[currentPhoto]}`;
  viewerImage.alt = `婚紗照片 ${number}`;
  viewerCounter.textContent = `${number} / ${String(availablePhotos.length).padStart(2, "0")}`;
}

function markPhotoUnavailable(index) {
  if (unavailablePhotos.has(index)) return;

  unavailablePhotos.add(index);
  const tile = galleryTiles.get(index);
  if (tile) {
    tile.remove();
    galleryTiles.delete(index);
  }

  if (!lightbox.hidden && currentPhoto === index) {
    updateViewer();
  }
}

function openPhoto(index) {
  if (unavailablePhotos.has(index)) return;

  currentPhoto = index;
  previouslyFocusedElement = document.activeElement;
  updateViewer();
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
  closeButton.focus();
}

function closeViewer() {
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
  viewerImage.removeAttribute("src");
  if (previouslyFocusedElement instanceof HTMLElement) {
    previouslyFocusedElement.focus();
  }
}

function showNextPhoto(direction) {
  const availablePhotos = getAvailablePhotos();
  if (availablePhotos.length === 0) {
    closeViewer();
    return;
  }

  const currentPosition = availablePhotos.indexOf(currentPhoto);
  const nextPosition = (currentPosition + direction + availablePhotos.length) % availablePhotos.length;
  currentPhoto = availablePhotos[nextPosition];
  updateViewer();
}

closeButton.addEventListener("click", closeViewer);
previousButton.addEventListener("click", () => showNextPhoto(-1));
nextButton.addEventListener("click", () => showNextPhoto(1));
viewerImage.addEventListener("error", () => {
  markPhotoUnavailable(currentPhoto);
});

lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeViewer();
});

viewerImage.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

viewerImage.addEventListener("touchend", event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 50) showNextPhoto(distance < 0 ? 1 : -1);
}, { passive: true });

document.addEventListener("keydown", event => {
  if (lightbox.hidden) return;

  if (event.key === "Escape") closeViewer();
  if (event.key === "ArrowRight") showNextPhoto(1);
  if (event.key === "ArrowLeft") showNextPhoto(-1);
});
