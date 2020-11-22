var express = require('express');
var router = express.Router();
var controller = require('../controller/index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/', function(req, res, next) {
  controller.detection(req, res);
});



module.exports = router;
