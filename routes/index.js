const { Router } = require('websocket-express');

var router = new Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, function(req, res, next) {
  res.locals.filter = null;
  res.render('index', { user: req.user });
});


module.exports = router;
