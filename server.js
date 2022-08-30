// Express är ett framework för webbapplikationer. Den hjälper oss att skapa en webbserver.
// Express är ett middleware som vi kan använda för att hantera HTTP-requests.
const express = require('express');
// Cookies är ett sätt att lagra data i en webbserver. Cookie-parser hjälper oss att hantera cookies.
const cookieParser = require("cookie-parser");
// express-session hjälper oss att hantera sessioner i express.
const sessions = require('express-session');
// express-minify-html hjälper oss att minifiera HTML-koden som skickas till webbläsaren.
const minifyHTML = require('express-minify-html');

// dotenv hjälper oss att läsa in environmentvariabler från .env-filen.
require('dotenv').config()

// Vi använder express för att skapa en webbserver.
const app = express();

// Inställningar för minimering av HTML-koden.
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true, // tar bort kommentarer, exempelvis <!-- -->
        collapseWhitespace: true, // tar bort blanka rader, exempelvis <br>
        collapseBooleanAttributes: true, // tar bort boolean attributer i taggar. Exempelvis <input checked> 
        removeAttributeQuotes: true, // tar bort attribut-citationstecken, exempelvis <input type="text">
        removeEmptyAttributes: true, // tar bort tomma attribut, exempelvis <input type="text" value="">
        minifyJS: true, // minifierar javascript-koden
        minifyCSS: true, // minifierar CSS-koden
        minifyURLs: true, // minifierar URL:er
        removeScriptTypeAttributes: true // tar bort script-typen, exempelvis <script type="text/javascript">
    }
}));

// Skapar en instans av en MongoDB klient
const MongoClient = require('mongodb').MongoClient
// Skapar en connectionstring till MongoDB
const connectionString = process.env.MONGODB_URI;
// Definierar databasnamn
const dbName = process.env.DATABASENAME
// Definierar collectionnamn
const collectionName = process.env.COLLECTIONNAME

// mellanlagringsvariabel som används till databasen
let quotesCollection = null;
// Databasinstansens variabel
let db = null;

// Antal millisekunder per dag
const oneDay = 1000 * 60 * 60 * 24; // Millisekunder * sekunder * minuter * timmar = 1 dag = 86400000 millisekunder

// Variabel för att hantera session
var session;
// Variabel för att hålla koll om användaren är admin
var isAdmin;

// Koppla in MongoDB
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        db = client.db(dbName)
        quotesCollection = db.collection(collectionName)
    })
    .catch(error => console.error(error))


// Visa status
console.log(new Date().toLocaleString())
console.log('The webpage is live and ready to receive requests.');
console.log('');

//Starta ejs engine och skapa en variabel för att hantera ejs-filer
//För mer information, se https://ejs.co/ 
app.set('view engine', 'ejs')

// Hantera GET-request med urlenkodning, exempelvis /?name=... 
app.use(express.urlencoded({ extended: true }))
// Hantera static-filer, exempelvis /css/...
app.use(express.static('public'))

// Hantera sessioner med hjälp av express-session och cookie-parser 
app.use(sessions({
    secret: process.env.COOKIEKEY,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false
}));

// Hantera sessioner med hjälp av express-session och cookie-parser
app.use(cookieParser());

// Öppna server i angiven port
app.listen(process.env.SERVERPORT, function () {
    console.log('listening on port ' + process.env.SERVERPORT)
})

// Hantera GET-request till index.html
app.get('/', (req, res) => {
    readCookie(req) // Läs in cookie
    res.render('index.ejs', { isAdmin: isAdmin }) // Skicka till index.ejs
})

// Hantera POST-request till cat.html
app.get('/cat', (req, res) => {
    readCookie(req) // Läs in cookie
    res.render('cat.ejs', { isAdmin: isAdmin }) // Skicka till index.ejs
})


// Hantera GET-request till login.html
app.get("/login", (req, res) => {
    res.render('login.ejs', { isAdmin: isAdmin }) // Skicka till login.ejs
})

// Hantera POST-request till login.html
app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    var adminName = process.env.ADMINNAME;
    var adminPassword = process.env.ADMINPASS;

    //Kontrollera om användarnamn och lösenord stämmer överens med admin användare
    if (username == adminName && password == adminPassword) {
        isAdmin = true              // Användaren är admin
        session = req.session       // Skapa session
        session.isAdmin = true      // Sätt session.isAdmin till true
        session.save()              // Spara session
        res.redirect('/')           // Skicka till index.ejs
    } else {
        res.redirect('/login')      // Skicka till login.ejs
    }
})

// Hantera GET-request till logout.html
app.get('/logout', (req, res) => {
    req.session.destroy(); // Radera session
    res.redirect('/');     // Skicka till index.ejs
});

// Kontrollera att objektet inte är null och att det inte är en tom array
function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) // Kontrollera om objektet har ett givet egenskap
            return false;
    }
    return JSON.stringify(obj) === JSON.stringify({}); // Returnera true om objektet är tomt
}

// Läs en cookie
function readCookie(req) {
    let session = req.session; // Hämta sessionen
    isAdmin = session.isAdmin; // Hämta session.isAdmin för att hålla koll om admin är inloggad
}

