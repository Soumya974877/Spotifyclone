// Create an audio object to play songs
let currentSong = new Audio();

// Store arrays of songs and the current folder
let songs;
let currFolder;

// Function to convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
    // Check if the input is not a number or negative, return "00:00"
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds with leading zeros
    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedSeconds}`;
}

// Function to fetch songs from a specified folder
function getSongs(folder) {
    return new Promise(async (resolve) => {
        currFolder = folder;

        // Fetch the HTML content of the folder
        let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let response = await a.text();

        // Extract song URLs from the HTML content
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        // Create the song list in the HTML
        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        for (const song of songs) {
            songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Soumyajit</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div></li>`;
        }

        // Add event listeners to song list items after a delay
        setTimeout(() => {
            Array.from(songUL.getElementsByTagName("li")).forEach(e => {
                document.querySelector(".songList").addEventListener("click", (event) => {

                    // Check if the clicked element is the play.svg button
                    if (event.target.tagName === 'IMG' && event.target.src.includes('play.svg')) {

                        // Get the corresponding song name from the parent li element
                        const songName = event.target.closest('li').querySelector('.info > div').textContent.trim();
                        playMusic(songName);
                        play.src = "img/pause.svg"; // Update play icon to pause
                    }
                });
                e.addEventListener("click", element => {
                    playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
                });
            });

            resolve(); // Resolve the promise after fetching songs and setting up event listeners
        }, 1000);
    });
}

// Function to play a specific song
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Main function to display songs and set up player controls
async function displaySongs() {
    await getSongs("songs");
    playMusic(songs[0], true);

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
            currentSong.currentTime
        )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    setTimeout(() => {
        previous.addEventListener("click", () => {
            currentSong.pause();

            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if (index - 1 >= 0) {
                playMusic(songs[index - 1]);
            }
        });

        // Add an event listener to next
        next.addEventListener("click", () => {
            currentSong.pause();


            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            if (index + 1 < songs.length) {
                playMusic(songs[index + 1]);
            }
        });
    }, 1000);

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {

        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    // Automatically play the next song when the current song ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });
}

displaySongs();
