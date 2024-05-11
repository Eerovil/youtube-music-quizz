/*

*/

import db from "../../../backend/db.json";

export interface VideoLink {
    title: string;
    id: string;
    thumbnail: string;
}

export interface ParsedVideoLinkGroup {
    title: string;
    links: VideoLink[];
}

export const getArtistNames = (): string[] => {
    return Object.keys(db);
}


export const getAllVideoLinks = (artistName: string): ParsedVideoLinkGroup[] => {
    const ret: ParsedVideoLinkGroup[] = [];
    console.log("getAllVideoLinks", artistName);
    console.log(db);
    const groups = db[artistName];
    console.log(groups)
    if (!groups) return ret;
    for (const groupName in groups) {
        const songs = groups[groupName];
        const parsedSongs = songs.map(song => {
            return {
                title: song.title,
                id: song.youtube,
                thumbnail: `https://i.ytimg.com/vi/${song.youtube}/hqdefault.jpg`
            }
        });
        ret.push({
            title: groupName,
            links: parsedSongs,
        });
    }
    return ret;
}