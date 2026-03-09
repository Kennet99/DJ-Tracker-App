import { v4 as uuidV4 } from "uuid";

//Task types:
type Song = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
};

const list = document.querySelector<HTMLUListElement>("#list");
const form = document.getElementById("new-song-form") as HTMLFormElement | null;
const input = document.querySelector<HTMLInputElement>("#new-song-title");
const songs: Song[] = loadSongs();
songs.forEach(addListItem);

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input?.value == "" || input?.value == null) return;

  const newSong: Song = {
    id: uuidV4(),
    title: input.value,
    completed: false,
    createdAt: new Date(),
  };
  songs.push(newSong);
  saveSongs();

  addListItem(newSong);
  input.value = "";
});

function addListItem(song: Song) {
  const item = document.createElement("div");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.addEventListener("change", () => {
    song.completed = checkbox.checked;
    saveSongs();
  });
  checkbox.type = "checkbox";
  checkbox.checked = song.completed;
  label.append(checkbox, song.title);
  item.append(label);
  list?.append(item);
}

function saveSongs() {
  localStorage.setItem("SONGS", JSON.stringify(songs));
}

function loadSongs(): Song[] {
  const songJSON = localStorage.getItem("SONGS");
  if (songJSON == null) return [];
  return JSON.parse(songJSON);
}
