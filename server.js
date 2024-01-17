const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION ❌ shutting down the server...');
    process.exit(1);
}))

const app = require('./app')

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

console.log(`Starting server on ${process.env.NODE_ENV} mode...`);
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('DB connection successful!')
})
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`); 
})

process.on('unhandledRejection', (err => {
    console.log(err);
    // console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION ❌ shutting down the server...');
    server.close(() => {
        process.exit(1);
    })
}))



