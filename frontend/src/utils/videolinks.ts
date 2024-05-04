/*

// Get all video links from a youtube playlist with this snippet
var dataList = "title;id\n";
var els = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-playlist-video-renderer');
var id="";
var title="";

for(i = 0;i<els.length;i++){
    var el = els[i];
    var title = el.title;
    title = title.replace(/ \(.*\)/g, '');
    
    dataList += (title + ";" + el.href.split('?v=')[1].split('&list')[0] + "\n");
}
console.log(dataList);
*/

interface VideoLinkGroup {
    title: string;
    data: string;
}

export interface VideoLink {
    title: string;
    id: string;
    thumbnail: string;
}

export interface ParsedVideoLinkGroup {
    title: string;
    links: VideoLink[];
}


const videoLinks: { [key: string]: VideoLinkGroup[] } = {
    nightwish: [
        {
            title: "Angels Fall First",
            data: `
            Elvenpath;GwKDj2YALVQ
            Beauty And The Beast;X4f8iN15vVE
            The Carpenter;vFtF5xr7WTQ
            Astral Romance;m_y2Xm8t8Ik
            Angels Fall First;vSRzCOEnY4Q
            Tutankhamen;FNjRfjJEF20
            Nymphomaniac Fantasia;5F3ZK52HzZg
            Know Why The Nightingale Sings;0mEGX4z6BZk
            Lappi, Pt. I Erämaajärvi;VwYeRnlp4y4
            Lappi, Pt. II Witchdrums;zLgJZqvw2OM
            Lappi, Pt. III This Moment Is Eternity;6UCzlNiSx64
            Lappi, Pt. IV Etiäinen;_HzoUpTq77s
            Return To The Sea;3zFmsW078aI
            Once Upon A Troubadour;UW68klXvnBk
            `
        },
        {
            title: "Oceanborn",
            data: `
            Stargazers;rdF3ntssZhE
            Gethsemane;5VgLLDekYcI
            Devil & The Deep Dark Ocean;bJbqgoDovgQ
            Sacrament of Wilderness;G5dJeNay_XU
            Passion And The Opera;gBPkkahVScc
            Swanheart;8Wb5ABApAVU
            Moondance;ariULvFxwMM
            The Riddler;UsiexyqgkNM
            The Pharaoh Sails To Orion;qRugk6vx9YY
            Walking In The Air;eCJrzz86IVc
            Sleeping Sun;QDLh9blnyvY
            Nightquest;06Jj4AdDdBA
            `
        }
    ]
    ,
}


export const getAllVideoLinks = (slug: string): ParsedVideoLinkGroup[] => {
    const ret: ParsedVideoLinkGroup[] = [];
    const groups = videoLinks[slug];
    if (!groups) return ret;
    for (const group of groups) {
        const lines = group.data.split("\n");
        const parsedLines = lines.filter(line => !!line.trim()).map(line => {
            const parts = line.split(";");
            const id = parts[1].trim();
            return {
                title: parts[0].trim(),
                id,
                thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
            }
        });
        ret.push({
            title: group.title,
            links: parsedLines
        });
    }
    return ret;
}