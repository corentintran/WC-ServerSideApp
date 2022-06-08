var express = require('express');
var router = express.Router();


/* ******* POST user register *******/
router.post('/register', function(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  }
  req.db.from("Users").select("*").where({ email })
    .then(users => {
      if (users.length > 0) {
        res.status(409).json({
          error: true,
          message: "User already exists"
        });
        return;
      }
      const hash = bcrypt.hashSync(password, 10);
      req.db.from("Users").insert({ email, hash })
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
  req.db.from("Users").select("*").where({ email })
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


/* ******** GET user profile *******/
router.get('/:email/profile', function(req, res, next) {
  const email = req.params.email;
  if (!email){
    res.status(404).json({ error: true, message:"Volcano with ID: 99999 not found." });
    return;
  }
  res.status(200).json({

  })

  .catch(err => {
    console.log(err);
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Query parameters are not permitted."
    })
  });
});


module.exports = router;