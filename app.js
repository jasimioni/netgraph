require('dotenv').config()
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'pug');
app.locals.pretty = true;

const devicesRoutes = require('./routes/devices');
const graphRoutes = require('./routes/graph');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/devices', devicesRoutes);
app.use('/graph', graphRoutes);
app.use('/', (req, res, next) => {
    /^\/?$/i.test(req.url) ? res.redirect('/devices') : next();
});

app.use((req, res, next) => {
    res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;

console.log(`Listening port ${PORT}`);
app.listen(PORT);
