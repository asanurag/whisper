const express = require('express');
const app = express();
const dotenv = require('dotenv')
const fileUpload = require('express-fileupload');
const cors = require('cors');

const databaseConnect = require('./config/database')
const authRouter = require('./routes/authRoute')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const messengerRoute = require('./routes/messengerRoute');

app.use(cors());

dotenv.config({
     path : 'backend/config/config.env'
})
app.use(fileUpload()); 
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/messenger',authRouter);
app.use('/api/messenger',messengerRoute);


const PORT = process.env.PORT || 5000
app.get('/', (req, res)=>{
     res.send('This is from backend Sever')
})

databaseConnect();

app.listen(PORT, ()=>{
     console.log(`Server is running on port ${PORT}`)
})