import { v4 as uuidV4 } from "uuid";
import CueOptions from "./cue-options.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type Song = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  createdAt?: Date;
  cueIn?: string | null;
  cueOut?: string | null;
  notes?: string;
};

type CueOption = {
  name: string;
  color: string;
};

type DropDownOptions = {
  cueInSelect: HTMLSelectElement;
  cueOutSelect: HTMLSelectElement;
};

let draggedCard: HTMLDivElement | null = null;

// Initialise DOM elements
const form = document.getElementById("new-song-form") as HTMLFormElement | null;
const gallery = document.getElementById("gallery") as HTMLDivElement;
const songInput = document.getElementById("song-input") as HTMLInputElement;
const artistInput = document.getElementById("artist-input") as HTMLInputElement;
const BPMInput = document.getElementById("BPM-input") as HTMLInputElement;
const addSongButton = document.getElementById(
  "add-song-button",
) as HTMLButtonElement;

// Helper function to update the disabled state of the add song button based on whether all input fields have valid values
function updateButtonState() {
  addSongButton.disabled =
    !songInput.value.trim() ||
    !artistInput.value.trim() ||
    !BPMInput.value.trim() ||
    isNaN(Number(BPMInput.value));
}

// Event listeners to validate form input
const songInputs = [songInput, artistInput, BPMInput];
songInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input === BPMInput) {
      const isValid = input.value.trim() !== "" && !isNaN(Number(input.value));
      input.classList.toggle("is-invalid", !isValid);
    } else {
      if (input.value.trim()) input.classList.remove("is-invalid");
    }
    updateButtonState();
  });
});

updateButtonState();

// Initialise empty song array and load songs from local storage and add them to the gallery on page load
const songs: Song[] = loadSongs();
songs.forEach(addSong);

// Event listener to add a song to the gallery when the form is submitted - prevent default form submission, create a new song object with a unique id and the title from the input field, add it to the songs array, save to local storage, and add it to the gallery
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  let validFormInput = true;
  // Validate form input and add 'is-invalid' class to any empty fields, then return early if any fields are invalid:
  if (!songInput.value.trim()) {
    songInput.classList.add("is-invalid");
    validFormInput = false;
  }
  if (!artistInput.value.trim()) {
    artistInput.classList.add("is-invalid");
    validFormInput = false;
  }
  if (!BPMInput.value.trim()) {
    BPMInput.classList.add("is-invalid");
    validFormInput = false;
  }
  if (!validFormInput) return;

  if (songInput?.value == "" || songInput?.value == null) return;

  const newSong: Song = {
    id: uuidV4(),
    title: songInput.value,
    artist: artistInput.value,
    bpm: BPMInput.value ? parseInt(BPMInput.value) : 0,
    createdAt: new Date(),
    cueIn: null,
    cueOut: null,
  };

  // Use .push to add the new song to the end of the songs array instead of unshift which adds it to the beginning:
  // songs.push(newSong);
  songs.unshift(newSong);
  saveSongs();

  addSong(newSong);
  gallery.prepend(gallery.lastElementChild as HTMLDivElement);

  // Reset form input values and remove 'is-invalid' class from all inputs:
  songInput.value = "";
  artistInput.value = "";
  BPMInput.value = "";

  songInputs.forEach((input) => input.classList.remove("is-invalid"));
  updateButtonState();
});

// Add a song to the gallery - pass in a song object and create a card element with the song title and delete button, then append it to the gallery
function addSong(song: Song) {
  const card = document.createElement("div");
  card.classList.add("card");

  const galleryItem = document.createElement("div");
  galleryItem.classList.add("gallery-item");

  const title = document.createElement("h5");
  title.textContent = song.title;
  title.classList.add("mb-0");

  const artist = document.createElement("p");
  artist.textContent = song.artist || "";
  artist.classList.add("mb-0", "text-muted", "small");

  const BPM = document.createElement("span");
  BPM.textContent = song.bpm ? `${song.bpm} BPM` : "";
  // BPM.classList.add("badge", "text-bg-secondary", "mw-2");
  BPM.classList.add(
    "badge",
    "rounded-pill",
    "text-bg-secondary",
    "ms-2",
    "fw-bold",
  );
  BPM.style.fontSize = "14px";
  if (song.bpm) title.appendChild(BPM);

  card.dataset.id = song.id; // Store the song id in a data attribute on the card element for easy access when deleting
  card.draggable = true;

  const textArea = document.createElement("textarea");
  textArea.classList.add("form-control", "form-control-sm");
  textArea.placeholder = "Notes...";
  textArea.id = `notes-${song.id}`;
  textArea.value = song.notes || "";
  // textArea.style.minWidth = "200px";
  // textArea.style.maxWidth = "400px";
  textArea.style.width = "100%";
  textArea.style.height = "40px";
  // textArea.style.resize = "none";
  textArea.style.fontSize = "1rem";

  const innerWrapper = document.createElement("div");
  innerWrapper.classList.add("inner-wrapper");

  const cueContainer = document.createElement("div");
  cueContainer.classList.add("cue-container");

  const metadataContainer = document.createElement("div");
  metadataContainer.classList.add("text-wrapper");

  const rightArrow = document.createElement("i");
  // rightArrow.classList.add("bi", "bi-arrow-right");
  // rightArrow.innerHTML = `<i class="bi bi-arrow-right-short"></i>`;
  rightArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
</svg>`;

  const cueInSelect = createDropdownOptions().cueInSelect;
  const cueOutSelect = createDropdownOptions().cueOutSelect;
  // With destructuring:
  // const { cueInSelect, cueOutSelect } = createDropdownOptions();

  // const item = document.createElement("div");
  // const label = document.createElement("label");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add(
    "btn",
    "btn-outline-danger",
    "btn-md",
    "float-end",
  );
  // deleteButton.textContent = "Delete";
  deleteButton.id = "delete-button-" + song.id;
  deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
  deleteButton.style.width = "40px";
  deleteButton.style.height = "40px";

  if (song.cueIn) {
    cueInSelect.value = song.cueIn;
    updateSelectColor(cueInSelect);
  }
  if (song.cueOut) {
    cueOutSelect.value = song.cueOut;
    updateSelectColor(cueOutSelect);
  }

  cueInSelect.addEventListener("change", () => {
    song.cueIn = cueInSelect.value;
    saveSongs();
    updateSelectColor(cueInSelect);
  });

  cueOutSelect.addEventListener("change", () => {
    song.cueOut = cueOutSelect.value;
    saveSongs();
    updateSelectColor(cueOutSelect);
  });

  deleteButton.addEventListener("click", () => removeSong(song.id, card));

  textArea.addEventListener("input", () => {
    song.notes = textArea.value;
    saveSongs();
  });

  // deleteButton.addEventListener("click", () => {
  //   const index = songs.findIndex((s) => s.id === song.id);
  //   if (index !== -1) {
  //     songs.splice(index, 1);
  //     saveSongs();
  //     galleryItem.remove();
  //   }
  // });

  // const checkbox = document.createElement("input");
  // checkbox.addEventListener("change", () => {
  //   song.completed = checkbox.checked;
  //   saveSongs();
  // });
  // checkbox.type = "checkbox";
  // checkbox.checked = song.completed;

  card.addEventListener("dragstart", () => {
    draggedCard = card;
    card.classList.add("dragging");
  });

  card.addEventListener("dragend", () => {
    draggedCard = null;
    card.classList.remove("dragging");
  });

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedCard) return;

    const rect = card.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (e.clientY < midpoint) {
      gallery.insertBefore(draggedCard, card);
    } else {
      gallery.insertBefore(draggedCard, card.nextSibling);
    }
  });

  card.addEventListener("drop", () => {
    syncSongsWithDOM();
  });

  metadataContainer.append(title, artist);
  cueContainer.append(cueInSelect, rightArrow, cueOutSelect);
  innerWrapper.append(cueContainer, textArea, deleteButton);

  galleryItem.append(metadataContainer, innerWrapper);
  card.appendChild(galleryItem);
  gallery.appendChild(card);
  // Use prepend to add the new card to the beginning of the gallery instead of the end:
  // gallery.prepend(card);
}

// Helper function to sync the order of songs in the songs array with the order of the cards in the DOM after a drag-and-drop reordering
function syncSongsWithDOM() {
  // Create an array from the DOM gallery
  const cards = Array.from(gallery.children) as HTMLDivElement[];
  const reordered = cards
    // For each card, find the corresponding song in the songs array using the data-id attribute and return an array of songs in the new order
    .map((card) => songs.find((song) => song.id === card.dataset.id))
    // Filter out any undefined values (in case a card doesn't have a corresponding song for some reason) and assert that the resulting array is of type Song[]
    .filter((song): song is Song => song !== undefined);
  // Reset the songs array
  songs.length = 0;
  // Add the reordered songs back to the songs array
  songs.push(...reordered);
  saveSongs();
}

// function removeListItem(id: string) {
//   const removeButton = document.getElementById(
//     "delete-button-" + id,
//   ) as HTMLButtonElement;
//   removeButton.addEventListener("click", () => {
//     const index = songs.findIndex((s) => s.id === id);
//     if (index !== -1) {
//       songs.splice(index, 1);
//       saveSongs();
//       galleryItem.remove();
//     }
//   });
// }

// Delete a song - pass in the id of the song to delete and the card element to remove from the DOM
function removeSong(id: string, card: HTMLDivElement) {
  const index = songs.findIndex((song) => song.id === id);
  if (index !== -1) {
    songs.splice(index, 1);
    saveSongs();
    card.remove(); // Remove the card element from the DOM
  }
}

// Save a song to local storage
function saveSongs() {
  localStorage.setItem("SONGS", JSON.stringify(songs));
}

// Load songs from local storage
function loadSongs(): Song[] {
  const songJSON = localStorage.getItem("SONGS");
  if (songJSON == null) return [];
  return JSON.parse(songJSON);
}

// Dynamically create dropdown options for cue in and cue out based on the CueOptions array in cue-options.json
function createDropdownOptions(): DropDownOptions {
  const cueInSelect = document.createElement("select");
  cueInSelect.style.width = "100px";
  cueInSelect.style.maxWidth = "120px";
  cueInSelect.classList.add("form-select", "form-select-md");
  cueInSelect.style.fontWeight = "bold";
  cueInSelect.style.height = "40px";

  const cueOutSelect = document.createElement("select");
  cueOutSelect.style.width = "100px";
  cueOutSelect.style.maxWidth = "120px";
  cueOutSelect.classList.add("form-select", "form-select-md");
  cueOutSelect.style.fontWeight = "bold";
  cueOutSelect.style.height = "40px";

  const cueInPlaceholderText = document.createElement("option");
  cueInPlaceholderText.value = "";
  cueInPlaceholderText.textContent = "IN";
  cueInPlaceholderText.selected = true;
  cueInSelect.appendChild(cueInPlaceholderText);

  const cueOutPlaceholderText = document.createElement("option");
  cueOutPlaceholderText.value = "";
  cueOutPlaceholderText.textContent = "OUT";
  cueOutPlaceholderText.selected = true;
  cueOutSelect.appendChild(cueOutPlaceholderText);

  CueOptions.forEach((option: CueOption) => {
    const { name, color } = option;

    const inOpt = document.createElement("option");
    inOpt.value = name;
    inOpt.textContent = name;
    inOpt.style.backgroundColor = color;

    const outOpt = document.createElement("option");
    outOpt.value = name;
    outOpt.textContent = name;
    outOpt.style.backgroundColor = color;

    cueInSelect.appendChild(inOpt);
    cueOutSelect.appendChild(outOpt);
  });

  return { cueInSelect, cueOutSelect };
}

// Helper function to update the background colour of selected value
function updateSelectColor(select: HTMLSelectElement) {
  if (select.value === "") {
    select.style.backgroundColor = "";
    select.style.color = "";
    return;
  }
  const match = (CueOptions as CueOption[]).find(
    (option) => option.name === select.value,
  );
  if (match) {
    select.style.backgroundColor = `#${match.color}`;
    select.style.color = "#fff";
  }
}

// function createDropdownOptions() {
//   CueOptions.forEach((option: CueOption) => {
//     const { name, color } = option;
//     const cueInOption = document.createElement("option");
//     cueInOption.value = name;
//     cueInOption.textContent = name;
//     cueInOption.style.backgroundColor = color;
//     const cueOutOption = document.createElement("option");
//     cueOutOption.value = name;
//     cueOutOption.textContent = name;
//     cueOutOption.style.backgroundColor = color;

//     const cueInSelect = document.getElementById(
//       "cue-in-select",
//     ) as HTMLSelectElement;
//     const cueOutSelect = document.getElementById(
//       "cue-out-select",
//     ) as HTMLSelectElement;

//     cueInSelect.appendChild(cueInOption);
//     cueOutSelect.appendChild(cueOutOption);
//   });
// }

// In-line return type:
// function createDropdownOptions(): {
//   cueInSelect: HTMLSelectElement;
//   cueOutSelect: HTMLSelectElement;
// } {...}
