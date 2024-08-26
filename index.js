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
            database:'2_querying_with_sql',
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
    if(!Password){
        response.status(400).send('!Password is Required');
        return;
    }
    try{
        const hashedPassword= await bcrypt.hash(Password,10);
        const selectUserQuery=`select * from user where username='${Username}'`;
        db.query(selectUserQuery,function(error,results){
            if(error){
                throw error;
            }
            if(results.length===0){
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
    }catch(e){
        console.error(e.message);
        response.status(500).send('Internal server error')
    }
});

//Login User API

app.post("/login", async (request, response) => {
    const { Username, Password } = request.body;
    if(!Password){
        response.status(400).send('!Password is Required');
        return;
    }
    try {
        const selectUserQuery = `SELECT * FROM user WHERE Username = '${Username}'`;
        db.query(selectUserQuery,async(error,results)=>{
            if(error){
                throw error;
            }
            if (results.length===0) {
                response.status(400);
                response.send("Invalid User");
            } else {
                const dbUser=results[0]
                console.log(results)
                console.log(dbUser)
                const isPasswordMatched = await bcrypt.compare(Password, dbUser.Password);
                if (isPasswordMatched === true) {
                    response.send("Login Success!");
                } else {
                    response.status(400);
                    response.send("Invalid Password");
                }
            }
        });
    } catch (e) {
        console.error(e.message);
        response.status(500).send('Internal server error');
    }
});