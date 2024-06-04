const {faker, tr} = require("@faker-js/faker");
const { count } = require("console");
const express = require('express');
const app = express();
const {v4 : uuid} = require('uuid');
const mysql = require('mysql2');
const path = require("path");
const methodOverride = require('method-override');
const e = require("express");
app.use(methodOverride('_method')); 
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.set('view engine','ejs');
app.set("views",path.join(__dirname,"/views"));
const connection = mysql.createConnection(
  {
    host:'localhost',
    user:'root',
    database:'delta_app',
    password:'ib53#@IB'
  }
);

let getRandomUser = ()=> {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ]
};

app.listen("8080",()=>{
  console.log("server is listening on port 8080");
});

app.get("/",(req,res)=>{
  let p = "SELECT count(*) FROM user";
  try{
      connection.query(p,(err,result)=>{
        if(err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs",{count});
      });
    }catch(err){
      res.send("some error in DB : ",err);
    }
});
app.get("/user",(req,res)=>{
  let show = `SELECT * FROM user
              ORDER BY username ASC`;
  try{
    connection.query(show,(err,result)=>{
      if(err) throw err;
      res.render("showusers.ejs",{result});
    })
  }catch(err){
    res.send("ERROR : ",err);
  }
});
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      res.render("edit.ejs",{user});
    });
  }
  catch(err)
  {
    console.log("ERROR : ",err);
  }
})
app.patch("/user/:id",(req,res)=>{
let {id} = req.params;
console.log(id);
let {username:newUsername, password:formPass} = req.body;
 try
 {
  let q = `SELECT * FROM user WHERE id='${id}'`;
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let user = result[0];
    if(formPass!=user.password)
      {
        res.send("WRONG PASSWORD");
      }
      else
      {
       let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
       try{
        connection.query(q2,(err,result)=>{
          if(err) throw err;
         console.log(result);
         res.redirect('/user'); 
        })
       }
       catch(err){
        console.log("ERROR : ",err);
       }
      }
  })
 }
 catch(err)
 {
  console.log(err);
 }
});
app.get("/user/:id/delete",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs",{user});
    });
  }
  catch(err)
  {
    console.log("ERROR : ",err);
  }
})
app.delete('/user/:id',(req,res)=>{
  let {id} = req.params;
  let {password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      if(user.password!=password)
        {
          res.send('Wrong password entered user cannot be deleted');
        }
        else
        {
          let q2 = `DELETE FROM user WHERE id = '${id}'`;
          try
          {
            connection.query(q2,(err,result)=>{
              if(err) throw err;
              else
              {
                res.redirect('/user');
              }
            })
          }
          catch(err)
          {
            res.send("ERROR : ",err);
          }
        }
    });
  }
  catch(err)
  {
    console.log("ERROR : ",err);
  }
})
app.get("/user/new",(req,res)=>{
  res.render('new.ejs');
})
app.post("/user/new",(req,res)=>{
let {email,username,password} = req.body;
let id = uuid();
let  q = `INSERT INTO user (id,username,email,password) VALUES ('${id}','${username}','${email}','${password}')`;
try
{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    res.redirect("/user");
  });
}
catch(err)
{
  res.send("ERROR : ",err);
}
});