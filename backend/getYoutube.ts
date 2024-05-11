import youtubesearchapi from "youtube-search-api";

export async function getYoutube(artistName: string, songName: string): Promise<string> {
    const searchQuery = `${artistName} ${songName}`;
    console.log(`Searching for ${searchQuery}`);
    const searchResults = await youtubesearchapi.GetListByKeyword(searchQuery, false);
    if (searchResults.error) {
        throw new Error(`Failed to search for ${searchQuery}: ${searchResults.error}`);
    }
    if (searchResults.items.length === 0) {
        throw new Error(`No results for ${searchQuery}`);
    }
    const firstResult = searchResults.items[0];
    return firstResult.id;
}
