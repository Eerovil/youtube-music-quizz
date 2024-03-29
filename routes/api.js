const { Router } = require('websocket-express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var ensureLoggedIn = ensureLogIn();
var db = require('../db');

const {
    getRoomMember,
    getRoomForMember,
    getRooms,
    createRoom,
    moveToRoom,
} = require('../yt');

const router = new Router();

router.get('/getuser', async function(req, res, next) {
    const userID = (req.user || {}).id || null;
    const sessionID = req.sessionID;
    const roomMember = await getRoomMember({ userID, sessionID })
    const room = await getRoomForMember(roomMember.id);

    res.json({
        user: req.user,
        csrftoken: req.csrfToken(),
        room: room,
        rooms: await getRooms(),
    });
});

router.post('/rooms', ensureLoggedIn, async function(req, res, next) {
    const userID = req.user.id;
    const title = req.body.title;
    await createRoom(userID, title);
    res.json({
        rooms: await getRooms(),
    });
});

router.post('/joinroom', async function(req, res, next) {
    const userID = (req.user || {}).id || null;
    const sessionID = req.sessionID;
    const roomMember = await getRoomMember({ userID, sessionID })
    await moveToRoom(roomMember.id, req.body.roomID);
    res.json({
        rooms: await getRooms(),
    });
});

module.exports = router;
