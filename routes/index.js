var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secretKey = "SUPER SECRET KEY DO NOT STEAL";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'The Volcano API' });
});

/* ************ GET me *************/
router.get('/me', function(req, res, next) {
  res.status(200).json({
    name: 'Corentin Tran',
    student_number: 'n11231670'
  })
});



/* *********** GET Countries *************/
router.get('/countries', function(req, res, next) {
  req.db.from('data').select('country').distinct()
  .then(rows => rows.map(row=>row.country))
  .then(
    countries => {
      res.status(200).json(countries)
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
// TODO filter with population
router.get('/volcanoes', function(req, res, next) {
  var filter;
  if (!req.query.country){
    res.status(400).json({ error: true, message:"Country is a required query parameter." });
    return;
  }
  const country = req.query.country
  if (!req.query.populatedWithin){
    filter = {'country':country};
  } else if (req.query.populatedWithin === '5km'){
    filter = 'country','=',country && 'population_5km','>',0
  }else if (req.query.populatedWithin === '10km'){
    filter = 'country','=',country && 'population_10km','>',0
  }else if (req.query.populatedWithin === '30km'){
    filter = 'country','=',country && 'population_30km','>',0
  }else if (req.query.populatedWithin === '100km'){
    filter = 'country','=',country && 'population_100km','>',0
  }else{
    res.status(400).json({ error: true, message:"Invalid value for populatedWithin. Only: 5km,10km,30km,100km are permitted." });
    return;
  }
  req.db.from('data').select('id', 'name', 'country', 'region', 'subregion').where(filter)
  .then(
    volcanoes => {
      res.status(200).json(volcanoes)
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
const authorized_access = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth){ //Authorization header not found => go to partial_access to volcano
    next();
  }
  if (auth.split(" ").length !== 2) { //Authorization header malformed => error 401
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed"
    });
    return;
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, secretKey);
    if (Date.now() > payload.exp) {
      res.status(401).json({
        error: true,
        message: "JWT token has expired"
      });
      return;
    }
    // Authorized : access to all volcano's data
    const id = req.params.id;
    if (!id){
      res.status(404).json({ error: true, message:'Volcano with ID: ' + id + 'not found.'});
      return;
    }
    req.db.from('data')
    .select('name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude', 'population_5km', 'population_10km', 'population_30km', 'population_100km')
    .where({'id':id})
    .then(
      volcano => {
        res.status(200).json(volcano)
        return;
      }
    )
    .catch(err => {
      console.log(err);
      res.status(400).json({
        error: true,
        message: "Invalid query parameters."
      })
    });

  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    return;
  }
};

const partial_access = function (req, res, next) {
  //partial access to volcano data
  const id = req.params.id;
  if (!id){
    res.status(404).json({ error: true, message:'Volcano with ID: ' + id + 'not found.' });
    return;
  }
  req.db.from('data')
  .select('name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude')
  .where({'id':id})
  .then(
    volcano => {
      res.status(200).json(volcano)
    }
  )
  .catch(err => {
    console.log(err);
    res.status(400).json({
      error: true,
      message: "Invalid query parameters."
    })
  });
};

/* ********* GET Volcanoes {id}***********/
router.get('/volcano/:id', authorized_access, partial_access);

module.exports = router;
