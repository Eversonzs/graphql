const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === "OPTIONS"){
    return res.sendStatus(200);
  }
  next();
});

app.put('/postImage'), (req, res, next) => {
  if(!req.isAuth){
    throw new Error('Not authenticated!');
  }
  if(!req.file){
    return res.status(200).json({message: 'No file provided.!'});
  }
  if(req.body.oldPath){
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({message: 'File stored.', filePath: req.file.path})
};

app.use(auth);

app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err){
    if(!err.originalError){
      return err;
    }
    console.log("this err graphql----", err);
    let data = err.originalError.data;
    let message = err.message || 'An error ocurred.';
    let code = err.code || 500;
    return { message: message, status: code, data: data};
  }
}));

app.use((error, req, res, next) => {
  console.log("here!!!!", error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

let username = 'ezelaya'
let password = '1.2.3.4.'

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@cluster0-5gbe2.mongodb.net/test?retryWrites=true`,
    { useNewUrlParser : true }
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
