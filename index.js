var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Volcano API' });
});



/* *********** GET Countries *************/
router.get('/countries', function(req, res, next) {
  req.db.from('data').select('country')
  .then(rows => rows.map(row=>row.country))
  .then(
    country => {
      res.status(200).json({
        country
      })
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Query parameters are not permitted."
    })
  });
});

/* *********  GET Volcanoes ***********/
router.get('/volcanoes', function(req, res, next) {
  const country = req.query.country;

  if (!country){
    res.status(400).json({ error: true, message:"Country is a required query parameter." });
    return;
  }
  req.db.from('data').select('id', 'name', 'country', 'region', 'subregion').where({'country':country})
  .then(
    volcanoes => {
      res.status(200).json({
        volcanoes
      })
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Only country and populatedWithin are permitted."
    })
  });
});


const authorize = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth.split(" ").length !== 2) {
    res.status(401).json({
      Error: true,
      Message: "Missing or malformed JWT"
    });
    return;
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, secretKey);
    if (Date.now() > payload.exp) {
      res.status(401).json({
        Error: true,
        Message: "Expired JWT"
      });
      return;
    }

    next();
  } catch (e) {
    res.status(401).json({
      Error: true,
      Message: "Invalid JWT"
    });
    return;
  }
};

/* ********* GET Volcanoes {id}***********/
router.get('/volcano/:id', authorize, function(req, res, next) {
  const id = req.params.country;

  if (!id){
    res.status(404).json({ error: true, message:"Volcano with ID: 99999 not found." });
    return;
  }
  req.db.from('data').select('id', 'name', 'country', 'region', 'subregion').where({'country':country})
  .then(
    volcanoes => {
      res.status(200).json({
        volcanoes
      })
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Only country and populatedWithin are permitted."
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
