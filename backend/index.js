
import { getArtist } from "./getArtist.ts";

const artistName = process.argv[2];

getArtist(artistName).then((artist) => {
    console.log("end");
});
