
var http     = require('http'),
    express  = require('express'),
    mysql    = require('mysql')
    parser   = require('body-parser'),
    aws      =require('aws-sdk'),
    multer   =require('multer'),
    multers3 =require('multer-s3'),
    //router =express.Router(),
    app = express(),
    jade =require('jade'),
    ejs=require('ejs');
app.use(express.static(__dirname + '/'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/** Load Config File */
aws.config.loadFromPath('config.json')
aws.config.update({
  signatureVersion: 'v4'
})
var awsobj = new aws.S3({});

var upload= multer({
  storage:multers3({
    s3:awsobj,
    bucket:'proectdemo',
    acl:'public-read',
    destination: function (req, file, cb) {
            cb(null, '/contact/')
        },
    metadata: function(req,file,callback){
      callback(null,{fieldName:file.fieldname});
    },
    key:function(req,file,callback){
      callback(null,Date.now()+file.originalname)
    }
  }),
  limits: {
        fileSize: 10000000
    }
});

app.get('/', function(req, res){
  res.render('index.html');
});

// Database Connection
var connection = mysql.createConnection({
  host     : 'mycloudprojectinstance.cs7jaxcvfskp.us-west-1.rds.amazonaws.com',
  user     : 'jyothiramesh',
  password : 'orrange0102',
  database : 'mycloudproject01',
  port : '3306',
  timeout: 60000
});
try {
    connection.connect();

} catch(e) {
    console.log('Database Connetion failed:' + e);
}
 //var app = express();
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 8081);
app.use(function (req, res, next) {

    // Website names to connect
    var allowedOrigins = ['http://www.savingfile.com', 'http://upload-env.tmnqr8eusq.us-west-1.elasticbeanstalk.com', 'http://localhost:8080'];
      var origin = req.headers.origin;
       if(allowedOrigins.indexOf(origin) > -1){
               res.setHeader('Access-Control-Allow-Origin', origin);
          }
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Origin,Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Create server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Server listening on port ' + app.get('port'));
});

app.get('/api/delete', function (req, res) {

   var params = {
        Bucket: 'proectdemo',
        Key: req.query.key
    };
  awsobj.deleteObject(params, function (err, data) {
        if (data) {
          console.log(data);
          connection.query('delete  from userdata where filekey = ?',[req.query.key], function (error, results, fields) {
            if (error) throw error;
            res.end(JSON.stringify(results));
         });
            console.log("File deleted successfully");
        }
        else {
            console.log("Check if you have sufficient permissions : "+err);
        }
    });
});


app.get('/api/userdata', function (req, res) {
   console.log(req.query.emailid);
   var querystring = "";
   if (req.query.emailid === "admin@admin.com")
   {
      querystring = "select firstname, lastname, emailid, filename, filelocation, created, filekey from userdata, logindata where userdata.emailid = logindata.email";
   }
   else {
     querystring = "select firstname, lastname, emailid, filename, filelocation, created, filekey from userdata, logindata where userdata.emailid = logindata.email and logindata.email = ?";
   }
   connection.query(querystring, [req.query.emailid], function (error, results, fields) {
   if (error) throw error;
   console.log(JSON.stringify(results));
   res.end(JSON.stringify(results));
 });
});

app.post('/api/login', function (req, res) {
  var response = [];
   console.log(req.body);
  var email = req.body.email, password =req.body.password;
   connection.query('select * from logindata where email =? and passwd=?',[email,password], function (error, result, fields) {
    console.log(result);
   var resu =JSON.stringify(result);
   console.log(res.length);
   if(resu.length > 2){
         response.push({'result' : 'success'});
        res.status(200).send(JSON.stringify(result));
        //res.render('contact.html')
   }else{
      response.push({'result' : 'Invalid User'});
        res.status(400).send(JSON.stringify(response));
   }
 });
});

app.post('/api/usercheck',upload.any(),function(req,res){
  //console.log(req.body);
  var emailid = req.body.emailid;
  console.log(emailid);
  connection.query("SELECT emailid FROM userdata where emailid = ?",[emailid],function(err,result){
      var res = JSON.stringify(result);
      console.log(res);
      console.log(res.length);
      console.log(res.length == 2);
      if( res.length == 2){
        console.log('hit api')
      }else{
        console.log('dont hit ')
      }
  })
   // console.log(a);
})
 app.post('/api/signup',function (req,res) {
    var response = [];
    console.log(req.body)
    if (
        typeof req.body.firstname !== 'undefined' &&
        typeof req.body.lastname !== 'undefined' &&
        typeof req.body.email!== 'undefined'
    ) {
      //console.log(req.body.firstname);
    //console.log(req.body.lastname);
    ///console.log(req.body.emailid);
        var firstname = req.body.firstname, lastname = req.body.lastname, email = req.body.email, password = req.body.password, aboutyou=req.body.aboutyou;//req.files[0].location;
   //console.log(filelocation);
        connection.query("INSERT INTO logindata (firstname, lastname, email, passwd, aboutyou) VALUES (?, ?, ?, ?, ?)",
            [firstname, lastname, email, password, aboutyou],
            function(err, result) {
                if (!err){

                    if (result.affectedRows != 0) {
                        response.push({'result' : 'success'});
                       } else {
                        response.push({'msg' : 'No Result Found'});
                    }
                    res.status(200).send(JSON.stringify(response));
                    return;
                } else {
                    console.log("err = " + err);
                    res.status(400).send(err);
                }
            });

    } else {
         response.push({'result' : 'error', 'msg' : 'Please fill required details'});
        res.status(400).send(JSON.stringify(response));
   }
});

 app.post('/api/userdata',upload.any(),function (req,res) {
    var response = [];
    console.log("emailid = " + req.body.emailid);
    if (typeof req.body.emailid !== 'undefined')
    {
      //console.log(req.body.firstname);
    //console.log(req.body.lastname);
    ///console.log(req.body.emailid);
        //var firstname = req.body.firstname, lastname = req.body.lastname,
        var emailid = req.body.emailid, filelocation = 'http://d3k0xqf32bnul5.cloudfront.net/'+req.files[0].key, filekey= req.files[0].key,filename=req.files[0].originalname, created= Date.now();//req.files[0].location;
   console.log(req.files[0]);
        connection.query("INSERT INTO userdata (emailid, filelocation, filekey, filename, created) VALUES ( ?, ?, ?, ?, ?)",
            [emailid, filelocation, filekey, filename, created],
            function(err, result) {
                if (!err){

                    if (result.affectedRows != 0) {
                        response.push({'result' : 'success'});
                       // console.log(req.files[0].location);
                     //   console.log(filelocation);


                    } else {
                        response.push({'msg' : 'No Result Found'});
                    }
                    res.status(200).send(JSON.stringify(response));
                    return;
                } else {
                    console.log("Unable to insert data into database " + err)
                    res.status(400).send(err);
                }
            });

    } else {
         response.push({'result' : 'error', 'msg' : 'Please fill required details'});
        res.status(400).send(JSON.stringify(response));
   }
});
