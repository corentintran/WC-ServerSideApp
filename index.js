var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Volcano API' });
});

router.get('/api', function(req, res, next) {
  res.render('index', { title: 'Lots of routes available' });
});

/* Countries */
router.get('/countries', function(req, res, next) {
  req.db.from('City').select('name','district')
  .then(
    rows => {
      res.status(200).json({
        Error: false,
        Message: "success",
        City: rows
      })
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      Error: true,
      Message: "Invalid query parameters."
    })
  });
});

/* Volcanoes */
router.get('/volcanoes/:Country', function(req, res, next) {
  const country = req.params.Country;

  req.db.from('volcanoes').select('*').where('country','=',country)
  //req.db.raw(`SELECT * FROM City WHERE CountryCode = '${countryCode}'`)
  .then(
    rows => {
      res.status(200).json({
        Error: false,
        Message: "success",
        Volcanoes: rows
      })
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      Error: true,
      Message: "Missing country query parameter or query parameters invalid. Click on 'Schema' below to see the possible error responses."
    })
  });
});

router.post('/api/update', function(req, res, next) {
  if (!req.body.City || !req.body.CountryCode || !req.body.Pop) {
    res.status(400).json({ Error: true, Message: "Missing parameter" });
    return;
  }
  req.db.from('City').update({'Population': req.body.Pop}).where({'CountryCode': req.body.CountryCode, 'Name': req.body.City })
  .then(() => res.status(200).json({
    Error: false,
    Message: `Updated population of ${req.body.City} to ${req.body.Pop}`
  }))
  .catch(err => {
    console.log(err);
    res.status(500).json({
      Error: true,
      Message: "Error in MySQL query"
    })
  });

  //res.send(JSON.stringify(req.body));

});

module.exports = router;
