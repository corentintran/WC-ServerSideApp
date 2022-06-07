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
      res.status(200).json(country)
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
  const pop = req.query.populatedWithin;

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

/* Authorization */
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
  req.db.from('data')
  .select('id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude')
  .where({'id':id})
  .then(
    volcano => {
      res.status(200).json({
        volcano
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

module.exports = router;
