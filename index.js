const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
let session = require('express-session');
const fs = require('fs')
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
const sessionTime = 1000 * 60 * 60 * 24;
let email = null;

app.use(session({
    secret: "hdsfhsjd889dsfsdfjhjsdhf",
    saveUninitialized: false,
    cookie: { maxAge: sessionTime },
    resave: false
}))
app.get('/', (req, res) => {
    if (req.session.email != undefined)
        res.redirect('/dash');
    else
        res.redirect('/login');
});
app.get('/regis', (req, res) => {
    res.render('signin');
})
app.post('/regis', (req, res) => {
    let data = fs.readFileSync('./creds.json').toString();
    data = JSON.parse(data);
    if (data[req.body.email] == undefined) {

        bcrypt.hash(req.body.pass, saltRounds, function (err, hash) {
            data[req.body.email] = hash;
            fs.writeFileSync('./creds.json', JSON.stringify(data));
            email = req.body.email;
            res.redirect('/dash')
        });
    }
    else {
        res.redirect('/login')
    }
})
app.get('/login', (req, res) => {
    if (req.session.email != undefined)
        res.redirect('/dash');
    else
        res.render('login');
});
app.post('/login', (req, res) => {
    console.log("in post")
    let data = fs.readFileSync('./creds.json').toString();
    data = JSON.parse(data)
    console.log(data);
    if (data[req.body.email]) {
        bcrypt.compare(req.body.pass, data[req.body.email], function (err, result) {
            // result == true
            if (result) {
                session = req.session
                session.email = req.body.email;
                console.log(req.body.email);
                email = req.body.email;
                res.redirect('/dash')
            }
            else
                res.send("Enter proper passcode")
        });
    }
    else
        res.redirect('/login')
});
app.get('/dash', (req, res) => {
    if (session.email != undefined)
        res.render('dashboard', { email: email })
    else
        res.redirect('/login');
})
app.get("/logout", (req, res) => {
    req.session.destroy();
    email = null;
    res.redirect("/");
})
app.listen(7999, (err) => {
    if (err) throw err;
    console.log("working on port : 7999")
})