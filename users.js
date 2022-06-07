var express = require('express');
var router = express.Router();


/* ******* POST user register *******/
router.post('user/register', function(req, res, next) {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  } else {
  res.status(201).json({
    message: "User created"
  })
  .catch(err => {
    console.log(err);
    res.status(409).json({
      error: true,
      message: "User already exists"
    })
  });
}
});
/* ********* POST user login *******/
router.post('user/login', function(req, res, next) {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: true, message: "Request body incomplete, both email and password are required" });
    return;
  } else {
  res.status(200).json({
    token: tkn,
    token_type: 'Bearer',
    expires_in: date
  })
  .catch(err => {
    console.log(err);
    res.status(401).json({
      error: true,
      message: "Incorrect email or password"
    })
  });
}
});
/* ******** GET user profile *******/
router.get('/user/:email/profile', function(req, res, next) {
  res.status(200).json({

  })
});
/* ************ GET me *************/
router.get('/me', function(req, res, next) {
  res.status(200).json({
    name: 'Corentin Tran',
    student_number: 'n11231670'
  })
});

module.exports = router;
