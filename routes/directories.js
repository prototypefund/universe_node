var express = require('express');
var router = express.Router();
//app.get('/api/directories',jwt.verify, (req, res) => {
router.get('/api/directories', (req, res) => {
  return db.Directory.findAll()
    .then((contacts) => res.send(contacts))
    .catch((err) => {
      console.log('There was an error querying contacts', JSON.stringify(err))
      return res.send(err)
    });
});
module.exports = router;
