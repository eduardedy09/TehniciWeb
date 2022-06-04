var express = require('express');
// include modulul express memorand in variabila express obiectul asociat modulului(exportat de modul)
var app = express();
const fs = require('fs');
const sharp = require('sharp');
const path=require('path');
const sass=require('sass');
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use("/resurse",express.static(__dirname+"/resurse"));

function creeazaImagini(){
    var date = new Date();
    let minutes = date.getMinutes();
    var buf = fs.readFileSync(__dirname + '/resurse/JSON/galerie.json').toString("utf-8");
    obIMG = JSON.parse(buf);
    for (let imag of obIMG.IMG){

        let nume_imag, extensie;
        [nume_imag, extensie ] = imag.cale_imagine.split(".");
        let dim_mic = 300;
        let dim_med = 600;
        imag.mic = `${obIMG.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`;
        imag.med = `${obIMG.cale_galerie}/mediu/${nume_imag}-${dim_med}.webp`;
        imag.mare = `${obIMG.cale_galerie}/${imag.cale_imagine}`;
       
            if(minutes <= 15){
                sfert_curent = 1;
            }
            else if(minutes > 15 && minutes <= 30){
                sfert_curent = 2;
            }
            else if(minutes > 30 && minutes <=45){
                sfert_curent = 3;
            }
            else
            {
                sfert_curent = 4;
            }
        if (!fs.existsSync(imag.mic))
            sharp(__dirname+"/"+imag.mare).resize(dim_mic).toFile(__dirname+"/"+imag.mic);
        if (!fs.existsSync(imag.med))
            sharp(__dirname+"/"+imag.mare).resize(dim_med).toFile(__dirname+"/"+imag.med);
    }
}

var sfert_curent;
creeazaImagini();

// index page
app.get(['/','/index'], function(req, res) {

  res.render('pagini/index',{ip:req.ip, IMG:obIMG.IMG, cale:obIMG.cale_galerie, sfert_curent:sfert_curent});
});


// contact
app.get('/contact', function(req, res) {
    res.render('pagini/contact');
});

// galerie statica
app.get('/galeriestatica', function(req, res) {
    res.render('pagini/galeriestatica',{IMG:obIMG.IMG, cale:obIMG.cale_galerie, sfert_curent:sfert_curent});
});

// galerie animata
app.get('/galerieanimata', function(req, res) {
    res.render('pagini/galerieanimata',{IMG:obIMG.IMG, cale:obIMG.cale_galerie, sfert_curent:sfert_curent});
});

app.get("*/galerie-animata.css",function(req, res){
    /*Atentie modul de rezolvare din acest app.get() este strict pentru a demonstra niste tehnici
    si nu pentru ca ar fi cel mai eficient mod de rezolvare*/
    res.setHeader("Content-Type","text/css");//pregatesc raspunsul de tip css
    let sirScss=fs.readFileSync("./resurse/SCSS/galerie_animata.scss").toString("utf-8");//citesc scss-ul cs string
    culori=["navy","black","purple","grey"]
    let culoareAleatoare =culori[Math.floor(Math.random()*culori.length)];//iau o culoare aleatoare pentru border
	//console.log(culoareAleatoare);
    //let nrImag= 10+Math.floor(Math.random()*5)*2;  //Math.floor(Math.random()*10) 
    let rezScss=ejs.render(sirScss,{culoare:culoareAleatoare});// transmit culoarea catre scss si obtin sirul cu scss-ul compilat
    //console.log(rezScss);
    fs.writeFileSync("./temp/galerie-animata.scss",rezScss);//scriu scss-ul intr-un fisier temporar

	let cale_css=path.join(__dirname,"temp","galerie-animata.css");//__dirname+"/temp/galerie-animata.css"
	let cale_scss=path.join(__dirname,"temp","galerie-animata.scss");
	sass.render({file: cale_scss, sourceMap:true}, function(err, rezCompilare) {
		console.log(rezCompilare);
		if (err) {
            console.log(`eroare: ${err.message}`);
            //to do: css default
            res.end();//termin transmisiunea in caz de eroare
            return;
        }
		fs.writeFileSync(cale_css, rezCompilare.css, function(err){
			if(err){console.log(err);}
		});
		res.sendFile(cale_css);
	});
	//varianta cu pachetul sass

});

app.get("*/galerie-animata.css.map",function(req, res){
    res.sendFile(path.join(__dirname,"temp/galerie-animata.css.map"));
});

// 403 page
app.get("/*.ejs",function(req, res){
    res.status(403).render("pagini/403");
});

// 404 page
app.get("/*",function(req, res){    
    res.render("pagini"+req.url, function(err,rezultatRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                res.status(404).render("pagini/404");
            }
            else 
                throw err;
        }
        else{
            res.send(rezultatRandare);
        }
    });
});


app.listen(8080);
console.log('Serverul ruleaza!');