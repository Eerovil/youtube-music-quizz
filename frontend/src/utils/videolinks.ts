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
    title = title.replace(/ \[.*\]/g, '');
    title = title.replace(//g, '');
    
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
            Lappi;FN04hmGUDbI
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
        },
        {
            title: "Wishmaster",
            data: `
            She Is My Sin;eyqoNXVriOo
            The Kinslayer;vBBokOsDMgA
            Come Cover Me;oD50SZFiuEs
            Two For Tragedy;q48lzqe4iJ4
            Wanderlust;c7x3ifHWKUM
            Wishmaster;IoIThfJfJpw
            Bare Grace Misery;DxaCXoL7A_k
            Crownless;hzpumFHRBU0
            Deep Silent Complete;Po5oWa7OX2k
            Dead Boy's Poem;LQZzoEHCV-w
            FantasMic;bO_UUaj-QLM
            Sleepwalker;M9fY81gSk_Y
            `
        },
        {
            title: "Over The Hills And Far Away EP",
            data: `
            Over The Hills And Far Away;4CFORwwrExM
            10th Man Down;flj6AKoWE3k
            Away;Hg84k2CNNas
            `
        },
        {
            title: "Century Child",
            data: `
            Bless the Child;gSohqju69GY
            End of all Hope;LWZtF9PLFok
            Dead to the World;YpHmrImI148
            Ever Dream;Uiiw0-ZW1DU
            Slaying the Dreamer;bJZrfUoZNZI
            Forever Yours;DxygxngCIPU
            Ocean Soul;6xnLWZh5XPE
            Feel for You;0TekrprUeX4
            Phantom of the Opera;wPj7N8oNA0g
            Beauty of the Beast;kKR8uc9QtIQ
            The Wayfarer;c_JU0ke5ZyY
            Lagoon;ClI6njdGJjE
            `
        },
        {
            title: "Once",
            data: `
            Dark chest of Wonders;E7uSU2Z62b0
            Wish I had an Angel;AD9WmPxTCiQ
            Nemo;xIOT6ZaSgrA
            Planet Hell;JtxyeVdSEms
            Creek Mary's Blood;_M_pooTwKro
            The Siren;HpNYDkkud7c
            Dead Gardens;ysPWgcCHR3U
            Romanticide;toC7G1n0e8w
            Ghost love Score;H_LYz2VyGEE
            Kuolema Tekee Taiteilijan;O8EuSKJalqI
            Higher than Hope;EkcRFT_qDVI
            White night Fantasy;EuWPAlawko0
            Live to Tell the Tale;YupcxzLbBz8
            `
        },
        {
            title: "Dark Passion Play",
            data: `
            The Poet and the Pendulum;rVVTiG9UgnE
            Bye Bye Beautiful;iy4ueq0opIw
            Cadence of Her Last Breath;V95jbKt-4RA
            Master Passion Greed;hBTRq2Kgt3Q
            Eva;KyB3w1ANk2A
            Sahara;OY8C5BcMKag
            Whoever Brings the Night;0yQlDpN8db8
            For the Heart I Once Had;2FjsufSjPSw
            The Islander;JnYG0UdwTRk
            Last of the Wilds;cWTdFolXEgA
            7 Days to the Wolves;aKeL83LFUSo
            Meadows of Heaven;AY9VI2B71bk
            Escapist;eKuCFk1j_Io
            While Your Lips Are Still Red;Kmiw4FYTg2U
            `
        },
        {
            title: "Imaginaerum",
            data: `
            Taikatalvi;pkdzpdLK3iA
            Storytime;-nj3hwwxovY
            Ghost River;6JZ-FQ2dgXE
            Slow, Love, Slow;_7gk64ko4eU
            I Want My Tears Back;mxw5gF4BT6Y
            Scaretale;SPLP1YUfxKo
            Arabesque;nCtNgqirjMs
            Turn Loose The Mermaids;KJ4yGAymH9Q
            Rest Calm;XFt94quMo9U
            The Crow, The Owl And The Dove;-YE-FcOUAO8
            Last Ride Of The Day;EYnZxMT-UOk
            Song Of Myself;SLIX1nVoam4
            Imaginaerum;7xB4nlZ-Vus
            The Heart Asks Pleasure First;4RVmGpImbdk
            `
        },
        {
            "title": "Endless Forms Most Beautiful",
            "data": `
            Shudder Before The Beautiful;JvgzGqAbHYE
            Weak Fantasy;IEsS6NNt3Bo
            Elan;micZX7Sl3Xc
            Yours Is An Empty Hope;ZZp9jp9k-mI
            Our decades in the sun;nKMWWO-eRHc
            My Walden;EsQbOLIAl2g
            Endless Forms Most Beautiful;ROQDbH1O5p4
            Edema Ruh;95YPVeV2sSM
            Alpenglow ;N2_ETb-63oo
            The Eyes Of Sharbat Gula;wGWmgBcd3nY
            The Greatest Show on Earth;n499M4pgc5o
            Sagan;1rT38pHbZl0
            `
        },
        {
            "title": "Human. :II: Nature.",
            "data": `
            Music;rwz7-h9LCDU
            Noise;r9dJtYxst-0
            Shoemaker;Rjp_DfvJimg
            Harvest;qSNChp1amRI
            Pan;bv5CAFlrNWE
            How's The Heart;tTdZD5uFjLs
            Procession;OZBpu67tbS0
            Tribal;s0bG2ce5blo
            Endlessness;DLFI7Cs7qmk
            All The Works...;RnOdQ5WNZJk
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