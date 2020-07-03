var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/', function(req, res, next) {
  Promise.resolve('a').then(()=>{
    a.b
    res.status(200).json('success');
  })




});

module.exports = router;
