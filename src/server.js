
import express from "express";
import session from "express-session";
import handlebars from "express-handlebars";
import { dirname } from "path";
import {fileURLToPath} from "url";



const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Server listening on port ${PORT}`));



const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname+"/public"));

app.engine(".hbs",handlebars.engine({extname: '.hbs'}));

app.set("views", __dirname+"/views");

app.set("view engine", ".hbs");

app.use(express.json()); 
app.use(express.urlencoded({extended:true})); 


app.use(session({
    secret:"claveSecreta",
    resave:true,
    saveUninitialized:true,
}));

const checkSession = (req,res,next)=>{
    
    if(req.session.user){
        res.redirect("/perfil");
    } else{
        next();
    }
}

app.get("/",(req,res)=>{
    res.render("home")
});

app.get("/registro",checkSession,(req,res)=>{
    res.render("signup")
});

app.get("/inicio-sesion",checkSession,(req,res)=>{
    res.render("login")
});

app.get("/perfil",(req,res)=>{
    if(req.session.user){
        res.render("profile");
    } else{
        res.send("<div>Debes <a href'/inicio-sesion'>inciar sesion</a> o <a href='/registro'>registrarte</a></div>")
    }
});

let users = [];


app.post("/signup",(req,res)=>{
    
    const newUser = req.body;
    
    const userExists = users.find(elm=>elm.email === newUser.email);
    if(userExists){
        
        res.render("signup",{error:"usuario ya registrado"});
    } else{
        users.push(newUser);
        req.session.user = newUser;
        res.redirect("/perfil")
    }
});

app.post("/login",(req,res)=>{
    const user = req.body;
    
    const userExists = users.find(elm=>elm.email === user.email);
    if(userExists){
        
        if(userExists.password === user.password){
            req.session.user = user;
            res.redirect("/perfil")
        } else{
            res.redirect("/inicio-sesion")
        }
    } else{
        res.redirect("/registro");
    }
});

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/")
});