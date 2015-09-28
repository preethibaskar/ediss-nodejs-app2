var Bookshelf = require('bookshelf');

var config = {
   host: 'ediss.ckhbt5h3z4bl.us-east-1.rds.amazonaws.com',  // your host
   user: 'preethiaws', // your database user
   password: 'preethiaws', // your database password
   database: 'ediss',
   charset: 'UTF8_GENERAL_CI'
};

var DB = Bookshelf.initialize({
   client: 'mysql', 
   connection: config
});

module.exports.DB = DB;
