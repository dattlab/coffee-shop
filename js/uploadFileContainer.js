document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");
  
  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone__over");
  });
  
  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, () => {
      dropZoneElement.classList.remove("drop-zone__over");
    });
  });
  
  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone__over");
  });
});

function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = document.querySelector(".drop-zone__thumb");

  if (document.querySelector(".drop-zone__prompt")) {
    document.querySelector(".drop-zone__prompt").remove();
  }

  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    }
  } else if (file.type === "application/pdf") {
    thumbnailElement.style.backgroundImage = `url('../assets/pdf-thumb.png')`;
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    thumbnailElement.style.backgroundImage = `url('../assets/docx-thumb.png')`;
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}
