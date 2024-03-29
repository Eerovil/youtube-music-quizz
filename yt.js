
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
    console.log("Deleting playlist items for playlist " + quizPlaylistID)
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
    await refreshQuizPlaylist(quizPlaylistID);
}

async function initializeQuizResults(quizID) {
    const quizItems = await new Promise((resolve, reject) => {
        db.all("SELECT qpi.* \
                FROM quiz_playlist_items qpi \
                JOIN quiz_playlists qp ON qpi.quiz_playlist_id = qp.id \
                WHERE qp.quiz_id = ?;",
            [quizID], function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            }
        );
    });
    const quizItemsCount = quizItems.length;
    console.log('Quiz items count: ' + quizItemsCount);
    const quizResultsID = await new Promise((resolve, reject) => {
        db.run('INSERT INTO quiz_results (quiz_id, current_index, last_index) VALUES (?, 0, ?)', [
            quizID,
            quizItemsCount,
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Quiz results initialized with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
    const randomOrdering = Array.from({length: quizItemsCount}, (_, i) => i);
    for (let i = quizItemsCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [randomOrdering[i], randomOrdering[j]] = [randomOrdering[j], randomOrdering[i]];
    }
    console.log('Random ordering: ' + randomOrdering);
    for (const randomIndex in randomOrdering) {
        const quizItem = quizItems[randomIndex];
        console.log('Adding quiz result row for item ' + quizItem);
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO quiz_result_rows (quiz_result_id, quiz_playlist_item_id, ordering) VALUES (?, ?, ?)', [
                quizResultsID,
                quizItem.id,
                randomIndex
            ], function(err) {
                if (err) {
                    reject(err);
                }
                console.log('Quiz result row added with ID ' + this.lastID);
                resolve(this.lastID);
            });
        });
    }
    return quizResultsID;
}

async function getCurrentQuizResultRowID(quizResultsID) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM quiz_result_rows WHERE quiz_result_id = ? AND ordering = (SELECT current_index FROM quiz_results WHERE id = ?)', [
            quizResultsID,
            quizResultsID
        ], function(err, row) {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.id);
        });
    });
}

async function addQuizAnswer(roomMemberID, quizResultRowID, quizPlaylistItemID) {
    await new Promise((resolve, reject) => {
        db.run('INSERT INTO quiz_result_answers (quiz_result_row_id, room_member_id, playlist_item_id) VALUES (?, ?, ?)', [
            quizResultRowID,
            roomMemberID,
            quizPlaylistItemID
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Quiz answer added with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
}

async function progressQuiz(quizResultsID) {
    await new Promise((resolve, reject) => {
        db.run('UPDATE quiz_results SET current_index = current_index + 1 WHERE id = ?', [
            quizResultsID
        ], function(err) {
            if (err) {
                reject(err);
            }
            console.log('Quiz progressed');
            resolve();
        });
    });
}

async function createRoom(ownerID) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO rooms (owner_id) VALUES (?)', [
            ownerID || null
        ], function(err) {
            if (err) {
                reject(err);
                return;
            }
            console.log('Room created with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
}

async function getRoomMember({userID, sessionID}) {
    if (userID) {
        const ret = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM room_members WHERE user_id = ?', [userID], function(err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
        if (ret) {
            return ret;
        }
    }
    if (sessionID) {
        const ret = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM room_members WHERE session_id = ?', [sessionID], function(err, row) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
        if (ret) {
            if (userID) {
                await new Promise((resolve, reject) => {
                    db.run('UPDATE room_members SET user_id = ? WHERE session_id = ?', [
                        userID,
                        sessionID
                    ], function(err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        console.log('Updated session to user');
                        resolve();
                    });
                });
            }
            return ret;
        }
    }

    return await new Promise((resolve, reject) => {
        db.run('INSERT INTO room_members (user_id, session_id) VALUES (?, ?)', [
            userID || null,
            sessionID || null
        ], function(err) {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Inserted user ${userID} or session ${sessionID} into room_members`);
            resolve();
        });
    });
}

async function getRoomForMember(roomMemberID) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM rooms WHERE id = (SELECT room_id FROM room_members WHERE id = ?)', [roomMemberID], function(err, row) {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

async function getRooms() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM rooms', function(err, rows) {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

async function createRoom(ownerID, title) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO rooms (owner_id, title) VALUES (?, ?)', [
            ownerID,
            title || null
        ], function(err) {
            if (err) {
                reject(err);
                return;
            }
            console.log('Room created with ID ' + this.lastID);
            resolve(this.lastID);
        });
    });
}

async function moveToRoom(roomMemberID, roomID) {
    if (!roomMemberID || !roomID) {
        throw new Error('roomMemberID and roomID are required');
    }
    await new Promise((resolve, reject) => {
        db.run('UPDATE room_members SET room_id = ? WHERE id = ?', [
            roomID,
            roomMemberID
        ], function(err) {
            if (err) {
                reject(err);
                return;
            }
            console.log(`Moved user ${roomMemberID} to room ${roomID}`);
            resolve();
        });
    });
}

async function test() {
    const userID = 1;
    const quizID = await createQuiz(userID, 'Test Quiz');
    await addQuizPlaylist(quizID, 'Test Playlist', 'PLaKGqsgrt0cI3FyY-h8U54DXJf2wQbtkO');
    await addQuizPlaylist(quizID, 'Test Playlist', 'PLMZx8SCEmX-ZK7qEK_s-W843cpQmvaz5n');
    const roomID = await createRoom(userID);
    const roomMember = await getRoomMember({userID, sessionID: null});
    await moveToRoom(roomMember.id, roomID);
    const quizResultsID = await initializeQuizResults(quizID);
    let quizResultRowID = await getCurrentQuizResultRowID(quizResultsID);
    await addQuizAnswer(1, quizResultRowID, 1);
    await progressQuiz(quizResultsID);
    quizResultRowID = await getCurrentQuizResultRowID(quizResultsID);
    await addQuizAnswer(1, quizResultRowID, 2);
    await progressQuiz(quizResultsID);
}

// test();


module.exports = {
    getRoomForMember,
    getRoomMember,
    getRooms,
    createRoom,
    moveToRoom,
}