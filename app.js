const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
const nodemailer = require('nodemailer');

// parser for forms undefined problem when submit form
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// email connection

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:'devarpit39@gmail.com',
        pass:'arpit'
    }
});

// database connection for storing data
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

// cookie parser
app.use(cookieParser());

connection.connect();

// this is for registration
app.post('/', (req, res) => {

    // verification
    function Store(pass) {
        var verify = Math.floor((Math.random() * 10000000) + 1);

        var mailOption = {
            from :'devarpit39@gmail.com', // sender this is your email here
            to : `${req.body.Email}`, // receiver email2
            subject: "Account Verification",
            html: `<h1>Hello Friend Please Click on this link<h1><br><hr><p>HELLO </p>
        <br><a href="http://localhost:3000/verification/?verify=${verify}">CLICK ME TO ACTIVATE YOUR ACCOUNT</a>`
        }
        // store data 

        var userData = { email: req.body.Email, password: pass, verification: verify };
        connection.query("INSERT INTO verify SET ?", userData, (err, result) => {
            if (err) {
                console.log(err)
            } else {
                transporter.sendMail(mailOption,(error,info)=>{
                    if(error){
                        console.log(error)
                    }else{

                        let userdata = {
                            email : `${req.body.Email}`,
                        }
                        res.cookie("UserInfo",userdata);
                        res.send("Your Mail Send Successfully")
                    }
                })
                console.log('Data Successfully insert')
            }
        })

    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.Password, salt, function (err, hash) {
            if (err) {
                console.log(err);
            } else {
                Store(hash);
            }
        });
    });
})

// verification 
app.get('/verification/',(req,res)=>{
    function activateAccount(verification) {
        if(verification == req.query.verify){
            connection.query("UPDATE verify SET active = ?","true",(err,result)=>{
                if(err){
                    console.log(err);
                }
                else{
                    let userdata = {
                        email : `${req.body.Email}`,
                        verify: "TRUE"
                    }
                    res.cookie("UserInfo",userdata);
                    res.send('<h1>Account Verification Successfully</h1>');
                }
            })
        }else{
            res.send("<h1>verification failed</h1>")
        }
    };

    connection.query("SELECT verify.verification FROM verify WHERE email = ?",req.cookies.UserInfo.email,(err,result) => {
        if(err){
            console.log(err);
        }else{
            activateAccount(result[0].verification);
            /* var verify1 = req.query.verify;
            var verify2 = result[0].verification; 
            if(verify1 == verify2) {
                activateAccount(result[0].verification);
            }else{
                res.send("<h1>verification fail</h1>")
            } */
        }
    })
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login',(req,res)=>{
    var email = req.body.Email;
    var pass = req.body.Password;

    function LoginSuccess() {
        let userdata = {
            email : `${req.body.Email}`,
            verify: "TRUE"
        }
        res.cookie("UserInfo",userdata);
        res.json({verify: "true"});
    }
    connection.query('SELECT * FROM verify WHERE email = ?',email,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            var hash = result[0].password;
            bcrypt.compare(pass, hash, function(err, res) {
                if(err){
                    res.json({msg:"ERROR"})
                }else{
                    LoginSuccess();
                }
            });

    //add new product
    app.post('/api/products',(req, res) => {
    let data = {product_title: req.body.product_title, product_description: req.body.product_description,product_quantity: req.body.product_quantity, product_price: req.body.product_price};
    let sql = "INSERT INTO product SET ?";
    let query = conn.query(sql, data,(err, results) => {
      if(err) throw err;
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
  });

  //update product
    app.put('/api/products/:id',(req, res) => {
    let sql = "UPDATE product SET product_quantity='"+req.body.product_quantity+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.params.id;
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
  });

  //Delete product
    app.delete('/api/products/:id',(req, res) => {
    let sql = "DELETE FROM product WHERE product_id="+req.params.id+"";
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
  });
        }
    })
})

app.listen(3000);