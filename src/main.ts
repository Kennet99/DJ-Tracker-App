import { v4 as uuidV4 } from "uuid";
import CueOptions from "./cue-options.json";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./style.css";

//Song types:
type Song = {
  id: string;
  title: string;
  // completed?: boolean;
  createdAt?: Date;
  cueIn?: string | null;
  cueOut?: string | null;
};

type CueOption = {
  name: string;
  color: string;
};

type DropDownOptions = {
  cueInSelect: HTMLSelectElement;
  cueOutSelect: HTMLSelectElement;
};

// Initialise DOM elements
const gallery = document.getElementById("gallery") as HTMLDivElement;
const form = document.getElementById("new-song-form") as HTMLFormElement | null;
// const input = document.querySelector<HTMLInputElement>("#new-song-title");
const searchInput = document.getElementById("search-input") as HTMLInputElement;

// Initialise empty song array and load songs from local storage
const songs: Song[] = loadSongs();
songs.forEach(addSong);

// Event listener to add a song to the gallery when the form is submitted - prevent default form submission, create a new song object with a unique id and the title from the input field, add it to the songs array, save to local storage, and add it to the gallery
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (searchInput?.value == "" || searchInput?.value == null) return;

  const newSong: Song = {
    id: uuidV4(),
    title: searchInput.value,
    // completed: false,
    // createdAt: new Date(),
    cueIn: null,
    cueOut: null,
  };
  songs.push(newSong);
  saveSongs();

  addSong(newSong);
  searchInput.value = "";
});

// Add a song to the gallery - pass in a song object and create a card element with the song title and delete button, then append it to the gallery
function addSong(song: Song) {
  const card = document.createElement("div");
  card.classList.add("card");
  const galleryItem = document.createElement("div");
  galleryItem.classList.add("gallery-item");
  const title = document.createElement("p");
  title.textContent = song.title;

  const cueInSelect = createDropdownOptions().cueInSelect;
  const cueOutSelect = createDropdownOptions().cueOutSelect;
  // With destructuring:
  // const { cueInSelect, cueOutSelect } = createDropdownOptions();

  // const item = document.createElement("div");
  // const label = document.createElement("label");
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger", "btn-sm", "float-end");
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", () => removeSong(song.id, card));

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

  galleryItem.append(title, cueInSelect, cueOutSelect, deleteButton);
  card.appendChild(galleryItem);
  gallery.appendChild(card);
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
  cueInSelect.style.maxWidth = "80px";
  cueInSelect.classList.add("form-select", "form-select-sm");
  const cueOutSelect = document.createElement("select");
  cueOutSelect.style.maxWidth = "80px";
  cueOutSelect.classList.add("form-select", "form-select-sm");

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
