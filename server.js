// Initialize Variabel
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const expressSanitizer = require('express-sanitizer');

const port = process.env.PORT || 3000;
const app = express();
const commentDB = path.join(__dirname, 'resources/comments.json');

// Setting up the view
hbs.registerPartials(path.join(__dirname, 'views/partials'));
hbs.registerHelper('getFaviconPath', () => 'resources/img/favicon.png');
hbs.registerHelper('getStylePath', () => 'resources/style/style.css');
hbs.registerHelper('getCurrentYear', () => new Date().getFullYear());
app.set('view engine', hbs);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());

// GET
// Main Site, it's where the guests put their comment
app.get('/', (req, res) => {
  res.render('index.hbs');
});

// Comments site is where all comments be shown
app.get('/comments', (req, res) => {
  // Get all the comment from the file
  fs.readFile(commentDB, 'utf8', (err, data) => {
    if (err) {
      res.render('comment.hbs', {
        isNotFound: true,
      });
    } else {
      let commentObjs = null;
      try {
        commentObjs = JSON.parse(data);
      } catch (error) {
        commentObjs = null;
      }
      res.render('comment.hbs', {
        pageComments: commentObjs,
      });
    }
  });
});

// POST
app.post('/comments', (req, res) => {
  const formName = req.sanitize(req.body.name);
  const formEmail = req.sanitize(req.body.email);
  const formComment = req.sanitize(req.body.comment);
  const guestComment = {
    name: formName,
    email: formEmail,
    comment: formComment,
  };

  fs.readFile(commentDB, 'utf8', (err, data) => {
    if (err) {
      const commentObjs = [];
      commentObjs.push(guestComment);

      try {
        fs.mkdirSync('resources');
      } catch (e) {
        // Do nothing
      }

      fs.appendFile(commentDB, JSON.stringify(commentObjs), (error) => {
        if (error) {
          console.log(error);
        } else {
          res.redirect('/comments');
        }
      });
    } else {
      let commentObjs;

      try {
        commentObjs = JSON.parse(data);
      } catch (e) {
        commentObjs = [];
      }

      commentObjs.push(guestComment);
      const commentString = JSON.stringify(commentObjs);

      fs.writeFile(commentDB, commentString, (error) => {
        if (error) {
          console.log(error);
        } else {
          res.redirect('/comments');
        }
      });
    }
  });
});

// Port Listen
app.listen(port, () => {
  console.log(`Server is up on the port ${port}`);
});
