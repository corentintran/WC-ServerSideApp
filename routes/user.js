var express = require('express');
var router = express.Router();


/* ******* POST user register *******/
router.post('/register', function(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  }
  req.db.from("users").select("*").where({ email })
    .then(users => {
      if (users.length > 0) {
        res.status(409).json({
          error: true,
          message: "User already exists"
        });
        return;
      }
      const hash = bcrypt.hashSync(password, 10);
      req.db.from("users").insert({ email, hash })
        .then(() => {
          res.status(201).json({message: "User created"});
        });
    })
});

/* ********* POST user login *******/
router.post('/login', function(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  }
  req.db.from("users").select("*").where({ email })
    .then(users => {
      if (users.length === 0) {
        res.status(401).json({
          error: true,
          message: "Incorrect email"
        });
        return;
      }

      const { hash } = users[0];

      if (!bcrypt.compareSync(password, hash)) {
        res.status(401).json({
          error: true,
          message: "Incorrect password"
        });
        return;
      }
      const expires_in = 60 * 60 * 24;

      //const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);

      res.status(200).json({ 
        token,
        token_type: "Bearer",
        expires_in
      });
    });
}
);


/* Authorization */
const authentificated_profile = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: /*"Authorization header ('Bearer token') not found"*/ "Authorization header is malformed"
    });
    next();
  }
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, secretKey);
    if (Date.now() > payload.exp) {
      res.status(401).json({
        error: true,
        message: "JWT token has expired"
      });
      next();
    }
    //Authentificated access to user profile
    const email = req.params.email;
    req.db.from('users').select('firstname', 'lastname', 'dob', 'address').where({ email })
    .then(users => {
      if (users.length === 0) {
        res.status(404).json({
          error: true,
          message: "Incorrect email"
        });
        return;
      }
      res.status(200).json({
        email,
        firstname,
        lastname, 
        dob,
        address
      })
      return;
    })

  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    next();
  }
};

const public_profile = function (req, res, next) {
  //partial access to user profile
  const email = req.params.email;
  req.db.from('users').select('firstname', 'lastname').where({ email })
  .then(users => {
    if (users.length === 0) {
      res.status(404).json({
        error: true,
        message: "Incorrect email"
      });
      return;
    }
    res.status(200).json({
      email,
      firstname,
      lastname
    })
  })
};

/* ******** GET user profile *******/
router.get('/:email/profile', authentificated_profile, public_profile);


module.exports = router;