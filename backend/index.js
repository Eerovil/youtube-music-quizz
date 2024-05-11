
import { getArtist } from "./getArtist.ts";
import { getYoutube } from "./getYoutube.ts";
import fs from "fs";

const artistName = process.argv[2];

// Check if file already exists
if (fs.existsSync(`${artistName}.json`)) {
    console.log("File already exists");
    const songs = JSON.parse(fs.readFileSync(`${artistName}.json`, "utf8"));
    console.log(songs);
    for (const albumName in songs) {
        for (const song of songs[albumName]) {
            if (song.youtube) {
                continue;
            }
            const youtube = await getYoutube(artistName, song.title);
            song.youtube = youtube;
            console.log(song.title, youtube);
        }
    }
    fs.writeFileSync(`${artistName}.json`, JSON.stringify(songs));
} else {
    getArtist(artistName).then((songs) => {
        // Write the songs to a file called artistName.json
        fs.writeFileSync(`${artistName}.json`, JSON.stringify(songs));
    });
}
