
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
var db = require('./db');

async function getAudioStream(videoID) {
    // Example of choosing a video format.
    let info = await ytdl.getInfo(videoID);
    let format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    return {
        url: format.url,
        mimeType: format.mimeType,
        approxDurationMs: format.approxDurationMs,
    }
}

async function getPlaylist(playlistID) {
    const playlist = await ytpl(playlistID);
    const values = {
        title: playlist.title,
        playlist_id: playlistID,
        thumbnail_url: playlist.bestThumbnail.url,
        items: playlist.items.map(item => {
            return {
                video_id: item.id,
                title: item.title,
                thumbnail_url: item.bestThumbnail.url
            }
        })
    }
    console.log(values)
    return values;
}


async function createQuiz(userID, title) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO quizes (owner_id, title) VALUES (?, ?)', [
            userID,
            title
        ], function(err) {
            if (err) {
                reject(err);
                return;
            }
            console.log('Quiz created with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
}


async function refreshQuizPlaylist(quizPlaylistID) {
    // playlistID is a string
    const playlistID = await new Promise((resolve, reject) => {
        db.get('SELECT playlist_id FROM quiz_playlists WHERE id = ?', [quizPlaylistID], function(err, row) {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.playlist_id);
        });
    });
    const playlist = await getPlaylist(playlistID);
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM quiz_playlist_items WHERE quiz_playlist_id = ?', [
            quizPlaylistID
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Deleted ' + this.changes + ' rows');
            resolve();
        });
    });
    await new Promise((resolve, reject) => {
        db.run('UPDATE quiz_playlists SET title = ?, thumbnail_url = ? WHERE id = ?', [
            playlist.title,
            playlist.thumbnail_url,
            quizPlaylistID
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Updated ' + this.changes + ' rows');
            resolve();
        });
    });
    await Promise.all(playlist.items.map(async item => {
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO quiz_playlist_items (quiz_playlist_id, video_id, title, thumbnail_url) VALUES (?, ?, ?, ?)', [
                quizPlaylistID,
                item.video_id,
                item.title,
                item.thumbnail_url
            ], function(err) {
                if (err) {
                    reject(err);
                }
                console.log('Playlist item added with ID ' + this.lastID);
                resolve(this.lastID);
            });
        });
    }));
}

async function addQuizPlaylist(quizID, playlistTitle, playlistID) {
    const quizPlaylistID = await new Promise((resolve, reject) => {
        db.run('INSERT INTO quiz_playlists (quiz_id, title, playlist_id) VALUES (?, ?, ?)', [
            quizID,
            playlistTitle,
            playlistID
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Playlist added with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
    await refreshQuizPlaylist(quizID, quizPlaylistID);
}

async function test() {
    const quizID = await createQuiz(1, 'Test Quiz');
    await addQuizPlaylist(quizID, 'Test Playlist', 'PLaKGqsgrt0cI3FyY-h8U54DXJf2wQbtkO');
}

test();
