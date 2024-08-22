let currentSong = new Audio();                        // to stop multiple songs playing at the same time
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {           //4
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {                   // 1
  currFolder = folder;
  let response = await fetch(`${folder}/songs.json`);
  songs = await response.json();
  songs = songs.map(song => `${folder}/${song}`);

  // show all songs in playlist
  let songUL = document.querySelector(".song-list ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    let songName = song.split('/').pop(); // Extract the song name
    songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="music-svg">
                <div class="songInfo">
                  <div class="songName">${songName}</div>
                  <div class="songArtist">Ayesha</div>
                </div>
                <div class="play-now">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="play-svg">
                </div>
            </li>`;
  }

  // Automatically play the first song of the album
  playMusic(songs[0].split('/').pop());

  // attach an eventListener to each song
  Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track) => {         //3
  currentSong.src = `/${currFolder}/` + track;
  currentSong.play();
  document.querySelector("#play").src = "img/pause.svg";  // Set to pause icon when playing

  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function dynamicAlbum() {

  const albums = ['myplay', 'saleena', 'av', 'atif', 'taylor'
, 'cs', 'rahet', 'ap', 'ariana', 'jasleen', 'diljit', 'ncs', 'aditiya', 'abdul', 'vishal', 'nusrat', 'sachin', 'lisa', 'ar'];

  let cardContainer = document.querySelector(".card-container");
  for (const album of albums) {
    try {
      // if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      const response = await fetch(`songs/${album}/info.json`);
      const albumInfo = await response.json();

      cardContainer.innerHTML += `
            <div data-folder="${album}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                            stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                    </svg>
                </div>
                <img src="/songs/${album}/cover.jpeg" alt="cover image" />
                <h3>${albumInfo.title}</h3>
                <p>${albumInfo.discription}</p>
            </div>`;
  
    } catch (error) {
      console.error(`Failed to fetch info.json for album ${album}:`, error);
    }
  }


  // Attach click event listeners to dynamically created cards
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      const folder = item.currentTarget.dataset.folder;
      await getSongs(`songs/${folder}`);
    });
  });

}

async function main() {    //2

  // get the list of all songs
  await getSongs("songs/myplay");

  currentSong.src = songs[0];  // setting one song as default song

  let playBtn = document.querySelector("#play");
  playBtn.src = "img/play.svg";  // Ensure the play button shows the play icon initially

  playBtn.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      playBtn.src = "img/pause.svg";  // Change to pause icon when playing
      document.querySelector(".song-info").innerHTML = decodeURI(currentSong.src.split('/').pop());
      document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
    } else {
      currentSong.pause();
      playBtn.src = "img/play.svg";  // Change to play icon when paused
      document.querySelector(".song-info").innerHTML = decodeURI(currentSong.src.split('/').pop());
    }
  });

  // Dynamically list albums in the console
  dynamicAlbum();

  // listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an event listener to seek bar that we can also move it manually 
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  // add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listener for previous and next
  previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
    let songNames = songs.map(song => decodeURIComponent(song.split('/').pop()));
    let index = songNames.findIndex(song => song === currentTrack);

    if (index > 0) {
      playMusic(songNames[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split('/').pop());
    let songNames = songs.map(song => decodeURIComponent(song.split('/').pop()));
    let index = songNames.findIndex(song => song === currentTrack);

    if (index >= 0 && index < songNames.length - 1) {
      playMusic(songNames[index + 1]);
    }
  });

  // add an event listener to volume 
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src =  document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg");
    }
  });

  // add an event listener to mute the track >> volume 
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });

  // Update the song name on pause
  currentSong.addEventListener("pause", () => {
    document.querySelector(".song-info").innerHTML = decodeURI(currentSong.src.split('/').pop());
  });

  // Update the song name on play
  currentSong.addEventListener("play", () => {
    document.querySelector(".song-info").innerHTML = decodeURI(currentSong.src.split('/').pop());
  });

}

main();
