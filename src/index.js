require('module-alias/register');
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const handlebars = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const session = require('express-session');
const passport = require('passport');
require('./components/auth/config/passportConfig');


//nodemon --inspect src/index.js
const db = require('./config/db');
db.connect();

const app = express();
const port = process.env.PORT || 3000;

const route = require('./routes');  

sessionMiddleware=session({
    secret: process.env.MY_SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
    cookie: {
        httpOnly: true,
        secure: false, // Chỉ dùng với HTTPS
        sameSite: 'lax', // Bảo vệ chống CSRF
        maxAge: 36000000 // Thời gian sống của session cookie
    }
})
app.use(sessionMiddleware);
// Khởi tạo Passport và session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Make flash messages available in templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json())
app.use(methodOverride('_method'));
app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.user = req.user; 
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',  // Đặt layout mặc định là 'main.hbs'
  layoutsDir: path.join(__dirname, 'common_views', 'layouts'),
  partialsDir: [
    path.join(__dirname, 'common_views', 'partials'),
    
    // Add the partials directory from the review component
    path.join(__dirname, 'components', 'review', 'views', 'partials'),
  ],
  helpers: require('./helpers/handlebars')
}));
app.set('view engine', 'hbs');

let viewPaths = [];

const componentsDir = path.join(__dirname,'components');
fs.readdirSync(componentsDir).forEach(component => {
    const componentPath = path.join(componentsDir, component);
    if (fs.existsSync(componentPath) && fs.lstatSync(componentPath).isDirectory()) {
        const viewPath = path.join(componentPath, 'views');
        if (fs.existsSync(viewPath)) {
            viewPaths.push(viewPath);
        }
    }
});


// Thêm các thư mục views khác như 'auth'
viewPaths.push(path.join(__dirname, 'auth', 'views'));

app.set('views', viewPaths);

route(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});