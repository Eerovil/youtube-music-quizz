/*

// Get all video links from a youtube playlist with this snippet
var dataList = "title;id;thumbnail\n";
var els = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-playlist-video-renderer');
var thumbnails = document.getElementsByClassName('yt-core-image--fill-parent-height yt-core-image--fill-parent-width yt-core-image yt-core-image--content-mode-scale-aspect-fill yt-core-image--loaded');
var id="";
var title="";
var thumbnail = "";
for(i = 0;i<els.length;i++){
    var el = els[i];
    var t = thumbnails[i];
    var title = el.title;
    title = title.replace(/ \(.*\)/g, '');
    
    dataList += (title + ";" + el.href.split('?v=')[1].split('&list')[0] + ";" + t.src.split('?')[0] + "\n");
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
            Elvenpath;GwKDj2YALVQ;https://i.ytimg.com/vi/rdF3ntssZhE/hqdefault.jpg
            Beauty And The Beast;X4f8iN15vVE;https://i.ytimg.com/vi/5VgLLDekYcI/hqdefault.jpg
            The Carpenter;vFtF5xr7WTQ;https://i.ytimg.com/vi/bJbqgoDovgQ/hqdefault.jpg
            Astral Romance;m_y2Xm8t8Ik;https://i.ytimg.com/vi/G5dJeNay_XU/hqdefault.jpg
            Angels Fall First;vSRzCOEnY4Q;https://i.ytimg.com/vi/Jj4j0g72nbc/hqdefault.jpg
            Tutankhamen;FNjRfjJEF20;https://i.ytimg.com/vi/4J5fEZGARxg/hqdefault.jpg
            Nymphomaniac Fantasia;5F3ZK52HzZg;https://i.ytimg.com/vi/RnOdQ5WNZJk/hqdefault.jpg
            Know Why The Nightingale Sings;0mEGX4z6BZk;https://i.ytimg.com/vi/CfDdMeal36w/hqdefault.jpg
            Lappi, Pt. I Erämaajärvi;VwYeRnlp4y4;https://i.ytimg.com/vi/GwKDj2YALVQ/hqdefault.jpg
            Lappi, Pt. II Witchdrums;zLgJZqvw2OM;https://i.ytimg.com/vi/X4f8iN15vVE/hqdefault.jpg
            Lappi, Pt. III This Moment Is Eternity;6UCzlNiSx64;https://i.ytimg.com/vi/vFtF5xr7WTQ/hqdefault.jpg
            Lappi, Pt. IV Etiäinen;_HzoUpTq77s;https://i.ytimg.com/vi/m_y2Xm8t8Ik/hqdefault.jpg
            Return To The Sea;3zFmsW078aI;https://i.ytimg.com/vi/rdF3ntssZhE/hqdefault.jpg
            Once Upon A Troubadour;UW68klXvnBk;https://i.ytimg.com/vi/jTSjgmSraUM/hq720.jpg
            `
        },
        {
            title: "Oceanborn",
            data: `
            Stargazers;rdF3ntssZhE;https://i.ytimg.com/vi/rdF3ntssZhE/hqdefault.jpg
            Gethsemane;5VgLLDekYcI;https://i.ytimg.com/vi/5VgLLDekYcI/hqdefault.jpg
            Devil & The Deep Dark Ocean;bJbqgoDovgQ;https://i.ytimg.com/vi/bJbqgoDovgQ/hqdefault.jpg
            Sacrament of Wilderness [HD];G5dJeNay_XU;https://i.ytimg.com/vi/G5dJeNay_XU/hqdefault.jpg
            Passion And The Opera;gBPkkahVScc;https://i.ytimg.com/vi/Jj4j0g72nbc/hqdefault.jpg
            Swanheart;8Wb5ABApAVU;https://i.ytimg.com/vi/4J5fEZGARxg/hqdefault.jpg
            Moondance;ariULvFxwMM;https://i.ytimg.com/vi/RnOdQ5WNZJk/hqdefault.jpg
            The Riddler;UsiexyqgkNM;https://i.ytimg.com/vi/CfDdMeal36w/hqdefault.jpg
            The Pharaoh Sails To Orion;qRugk6vx9YY;https://i.ytimg.com/vi/rdF3ntssZhE/hqdefault.jpg
            Walking In The Air;eCJrzz86IVc;https://i.ytimg.com/vi/5VgLLDekYcI/hqdefault.jpg
            Sleeping Sun;QDLh9blnyvY;https://i.ytimg.com/vi/bJbqgoDovgQ/hqdefault.jpg
            Nightquest;06Jj4AdDdBA;https://i.ytimg.com/vi/G5dJeNay_XU/hqdefault.jpg
            Sleeping Sun;mpYfw2EHYGQ;https://i.ytimg.com/vi/gBPkkahVScc/hqdefault.jpg
            Swanheart [HD];Dc-0jBxCfhA;https://i.ytimg.com/vi/8Wb5ABApAVU/hqdefault.jpg
            The Pharaoh Sails To Orion [HD];_4Aewzbzfek;https://i.ytimg.com/vi/ariULvFxwMM/hqdefault.jpg
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
            return {
                title: parts[0].trim(),
                id: parts[1].trim(),
                thumbnail: parts[2].trim()
            }
        });
        ret.push({
            title: group.title,
            links: parsedLines
        });
    }
    return ret;
}