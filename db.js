var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');

mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE \
  )");
  
  db.run("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )");

  db.run("CREATE TABLE IF NOT EXISTS quizes ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT, \
    UNIQUE (owner_id, title) \
  )");

  db.run("CREATE TABLE IF NOT EXISTS quiz_playlists ( \
    id INTEGER PRIMARY KEY, \
    quiz_id INTEGER NOT NULL, \
    title TEXT, \
    playlist_id TEXT, \
    thumbnail_url TEXT \
  )");

  db.run("CREATE TABLE IF NOT EXISTS quiz_playlist_items ( \
    id INTEGER PRIMARY KEY, \
    quiz_playlist_id INTEGER NOT NULL, \
    video_id TEXT, \
    title TEXT, \
    thumbnail_url TEXT, \
    UNIQUE (quiz_playlist_id, video_id) \
  )");

  // When a quiz is started in a new room, a quiz_results row is created
  // It will generate n quiz_result_rows rows where n is max number of questions
  db.run("CREATE TABLE IF NOT EXISTS quiz_results ( \
    id INTEGER PRIMARY KEY, \
    quiz_id INTEGER NOT NULL, \
    current_index INTEGER, \
    last_index INTEGER, \
    room_id INTEGER \
  )");

  // Each quiz result row knows it's quiz playlist item already
  // The players will not know
  // Audio offset will be set when the video stream is fetched
  db.run("CREATE TABLE IF NOT EXISTS quiz_result_rows ( \
    id INTEGER PRIMARY KEY, \
    quiz_result_id INTEGER NOT NULL, \
    quiz_playlist_item_id INTEGER NOT NULL, \
    audio_offset INTEGER, \
    start_time INTEGER \
  )");

  // When quiz question comes up, the server will fetch the stream url
  // And select a random start time, add it to DB
  // and send it to the players
  // When all are buffered, the players will send a ready signal
  // The server will then send a start signal
  // The players will then start the stream at the given offset
  // quiz_result_row start_time is the time the server sent the start signal

  // When a player answers, the server will add the answer to the DB
  db.run("CREATE TABLE IF NOT EXISTS quiz_result_answers ( \
    id INTEGER PRIMARY KEY, \
    quiz_result_row_id INTEGER NOT NULL, \
    room_member_id INTEGER NOT NULL, \
    playlist_item_id INTEGER NOT NULL, \
    answer_time INTEGER \
  )");

  db.run("CREATE TABLE IF NOT EXISTS rooms ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT, \
    quiz_progress_id INTEGER \
  )");

  // Users are either user_ids or session_ids (if not logged in)
  db.run("CREATE TABLE IF NOT EXISTS room_members ( \
    id INTEGER PRIMARY KEY, \
    room_id INTEGER NOT NULL, \
    user_id INTEGER, \
    session_id TEXT \
  )");
});

module.exports = db;
