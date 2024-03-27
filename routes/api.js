const { Router } = require('websocket-express');

const router = new Router();

router.get('/getuser', function(req, res, next) {
    res.json({
        user: req.user,
        csrftoken: req.csrfToken(),
    });
});

module.exports = router;
