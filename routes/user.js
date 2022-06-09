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
      req.db.from("users").insert({ email, hash, firstName:null, lastName:null, dob:null, address:null})
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
      const exp_in = 60 * 60 * 24;

      const exp = Date.now() + expires_in * 1000;
      const tkn = jwt.sign({ email, exp }, secretKey);

      res.status(200).json({ 
        token: tkn,
        token_type: "Bearer",
        expires_in: exp_in
      });
    });
}
);


/* Authorization */
const authentificated_profile = function (req, res, next) {
  const auth = req.headers.authorization;
  if(!auth){
    next();
  }
  if (auth.split(" ").length !== 2) {
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
    const user_email = payload.email;
    //Authentificated access to user profile
    const email = req.params.email;
    if (email === user_email) {//the authentificated user wants to access his own profile
      req.db.from('users').select('firstname', 'lastname', 'dob', 'address').where({ email })
      .then(user_profile => {
        res.status(200).json(user_profile)
        return;
      })
    } 
    next(); //the authentificated user wants to access someome else's profile, go to public profile

  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    return;
  }
};

const public_profile = function (req, res, next) {
  //partial access to user profile
  const email = req.params.email;
  req.db.from('users').select('email', 'firstname', 'lastname').where({ email })
  .then(users => {
    if (users.length === 0) {
      res.status(404).json({
        error: true,
        message: "Incorrect email"
      });
      return;
    }
    res.status(200).json(users)
  })
};

/* ******** GET user profile *******/
router.get('/:email/profile', authentificated_profile, public_profile);

/* ******** PUT user profile *******/
const authentify = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found or Authorization header is malformed"
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
    next();
  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token"
    });
    return;
  }
}

router.put('/:email/profile', authorize, function (req, res, next) {
  
    const user_email = payload.email;
    const email = req.params.email;

    
    //Authentificated matching user
    if (email === user_email) {
      const {firstName, lastName, dob, address} = req.body;
      //Missing body keys
      if (!firstName || !lastName || !dob || !address){
        res.status(400).json({
          error: true,
          message: "Request body incomplete: firstName, lastName, dob and address are required."
        })
        return;
      }
      //Invalid FirstName, LastName or Address
      if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string'){
        res.status(400).json({
          error: true,
          message: "Request body invalid: firstName, lastName and address must be strings only."
        })
        return;
      }
      //Invalid Date Format
      if (dob.match(/^\d{4}-\d{2}-\d{2}$/) === null) {
        res.status(400).json({
          error: true,
          message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
        })
        return;
      }
      //Invalid Date
      /*if (){
        res.status(400).json({
          error: true,
          message: "Invalid input: dob must be a date in the past."
        })
        return;
      }*/
      req.db.from('users').update({'firstname':firstName}, {'lastname':lastName}, {'dob':dob}, {'address':address}).where({ email })
      .then(user_profile => {
        res.status(200).json({
          email,
          firstName,
          lastName,
          dob,
          address
        })
      })
    } else { 
    //Authentificated non matching user
      res.status(403).json({
        error: true,
        message: "Forbidden"
      });
      return;
    }
  
  
});


module.exports = router;