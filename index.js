const express=require('express');
const mysql=require('mysql2');
const bcrypt=require('bcrypt');

const app=express();
app.use(express.json());

let db=null;

const initializeDBAndServer=async()=>{
    try{
        db=await mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'Mohan@983',
            database:'5_users_database',
            multipleStatements:true
        });
        app.listen(4000,()=>{
            console.log('server is running at http://localhost:4000/');
        })
    }catch(e){
        console.log(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

//Create User API

app.post('/users/', async(request,response)=>{
    const {Username,Password,Name,Gender}=request.body;
    const hashedPassword= await bcrypt.hash(Password,10);
    const selectUserQuery=`select * from user where Username='${Username}'`;
    const dbUser=db.query(selectUserQuery,function(error,results){
        if(error){
            throw error;
        }
        response.send(results);
    });
    if(dbUser===undefined){
        const createUserQuery=`insert into 
        user (Username,Password,Name,Gender) 
        values ('${Username}','${hashedPassword}','${Name}','${Gender}')`;
        db.query(createUserQuery,function(error,results){
            if(error){
                throw error;
            }
            response.send('Registered Successfully')
        })
    }else{
        response.status(400);
        response.send('Username Already exist');
    }
});

//Login User API

app.post("/login", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbUser=db.query(selectUserQuery,function(error,results){
        if(error){
            throw error;
        }
        response.send(results);
    });
    if (dbUser === undefined) {
        response.status(400);
        response.send("Invalid User");
    } else {
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
        if (isPasswordMatched === true) {
            response.send("Login Success!");
        } else {
            response.status(400);
            response.send("Invalid Password");
        }
    }
});