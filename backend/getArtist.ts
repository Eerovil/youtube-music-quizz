// This is a command line script to fetch all songs of an artist from the database
// Usage: ts-node backend/getArtist.ts <artistName>

import { DiscogsClient } from '@lionralfs/discogs-client';
import dotenv from 'dotenv';

const waitIfRatelimited = async (response: any) => {
    const remaining = response.rateLimit.remaining;
    console.log(`Remaining requests: ${remaining}`);
    if (remaining === 0) {
        const reset = 30;
        const now = new Date().getTime();
        const waitTime = reset * 1000 - now;
        console.log(`Ratelimited, waiting for ${waitTime} ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
};

export const getArtist = async (artistName: string) => {
    const config = dotenv.config({ path: './.env' });
    if (config.error) {
        throw config.error;
    }
    const token = config.parsed?.DISCOGS_TOKEN; // Add null check for config.parsed
    console.log(token);
    let client = new DiscogsClient({ userAgent: 'EerovilMusicQuiz/1.0', auth: { userToken: token}});
    let db = client.database();

    console.log(`Fetching artist ${artistName}`);

    // Find artist id
    let searchResult = await db.search({ query: artistName });
    const artistResult = searchResult.data.results.find(result => result.type === 'artist');
    if (!artistResult) {
        throw new Error(`Artist ${artistName} not found`);
    }
    const artistId = artistResult.id;
    console.log(`Found artist ${artistName} with id ${artistId}`);

    // Fetch artist metadata
    const artistData = await db.getArtist(artistId);
    console.log("artistData", artistData);

    // Fetch artist releases
    let page = 1;
    const releaseIds: number[] = [];
    while (true) {
        const releasesResult = await db.getArtistReleases(artistId, { page, per_page: 100 });
        const filteredReleases = releasesResult.data.releases.filter(release => {
            if (release.type !== 'master') {
                return false;
            }
            if (release.role !== 'Main') {
                return false;
            }
            return true;
        });
        releaseIds.push(...filteredReleases.map(release => release.main_release));
        console.log("releases", filteredReleases);
        break;
        page++;
    }

    const songs = {};
    for (const releaseID of releaseIds) {
        const releaseSongs: any[] = [];
        console.log(`Fetching release ${releaseID}`);
        const releaseData = await db.getRelease(releaseID);
        await waitIfRatelimited(releaseData);
        console.log("releaseData", releaseData);
        let formatGood: boolean | null = null;
        for (const format of releaseData.data.formats) {
            console.log(`Checking format`, format);
            for (const description of (format.descriptions || [])) {
                if (formatGood === null && description == 'Album') {
                    formatGood = true;
                }
                if (description == 'Reissue') {
                    formatGood = false;
                    break;
                }
                if (description == 'Compilation') {
                    formatGood = false;
                    break;
                }
            }
        }
        if (!formatGood) {
            continue;
        }
        for (const track of releaseData.data.tracklist) {
            console.log(`Checking track`, track);
            if (!track.title) {
                continue;
            }
            let artistGood = false
            // @ts-ignore
            const artists = track.artists || [];
            if (artists.length === 0) {
                artistGood = true;
            }
            for (const artist of artists) {
                if (artist.id === artistId) {
                    artistGood = true;
                    break;
                }
            }
            if (!artistGood) {
                continue;
            }
            if (track.type_ === 'track') {
                releaseSongs.push(track);
                console.log(`Found song`, track);
            }
        }
        songs[releaseData.data.title] = releaseSongs;
    }
    console.log("songs", songs);
    return songs;
};

