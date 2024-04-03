const Env = require('./models/env');
const Config = require('./models/configmodel');
const Status = require('./models/devicestatus');
const express = require('express');
var qs = require('querystring');
const mongoose = require('mongoose');
const hbs = require('hbs');
var path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');


var app = express();
app.use(express.urlencoded());
app.use(express.json());



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views')
const static_path = path.join(__dirname, "/public")
app.use(express.static(static_path));
console.log(static_path);
const WebSocket = require('ws');
const { env } = require('process');
hbs.registerHelper('iff', function (a, operator, b, opts) {
  var bool = false;
  switch (operator) {
    case '==':
      bool = a == b;
      break;
    case '>':
      bool = a > b;
      break;
    case '<':
      bool = a < b;
      break;
    case '!=':
      bool = a != b;
      break;
    default:
      throw "Unknown operator " + operator;
  }

  if (bool) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
});

hbs.registerHelper('ifCond', function (v1, options) {
  if (v1 % 3 == 2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('iftime', function (v1, v2, options) {
  if (v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('forlist', function (v1, v2, options) {
  var i;
  var cmd = "<option selected value=" + v2 + ">" + (v2) + "</option>";
  for (i = 0; i < v1.length; i++) {
    if (v1[i] != v2) {
      cmd += "<option value=" + v1[i] + ">" + (v1[i]) + "</option>"

    }

  }
  return cmd;
});

const port = 3002;
var hum = "30";


app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});



var appPort = 3001;
// Normal HTTP configuration
//let http = require('http').Server(app;

//const wss = new WebSocket.Server({ server:http });
const wss = new WebSocket.Server({ port: appPort });
wss.on('connection', async function connection(wssLocal) {
  console.log('A new client Connected!111111111111111111 11111111111111111111111111');
  // ws.send('node0_status_pir_x');


  wss.on('message', function incoming(message) {
    console.log('received: %s', message);

    wss.clients.forEach(function each(client) {
      if (client !== wss && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

  });
  const query = {};
  const sort = { time: -1 };
  const limit = 1;
  const envs = await Env.find({}).sort(sort).limit(1);
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA")
  console.log(envs);
  console.log("BBBBBBBBBBBBBBBBBBBB")
  var test = [{ "temperature": envs[0].temperature, "humidity": envs[0].humidity, "ec": envs[0].ec, "ph": envs[0].ph, }];


  var statusAllJson = JSON.stringify(test);

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {

      console.log(statusAllJson);
      client.send(statusAllJson);

    }
  });


});



mongoose.connect('mongodb+srv://tonkaowrl:tonkaow3690@tonkaoww.cbmwzby.mongodb.net/', {
  useNewUrlParser: true
});

app.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
app.get('/temp', (req, res) => {
  var temp = 10;
  var temperature = "temp=" + temp
  res.send(temperature);
});


app.get('/tracking', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("tracking", { log: log })

});
app.get('/setting', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("setting", { log: log })

});
app.get('/uploadphoto', async (req, res) => {
  //const log = await managementlog.find();
  //console.log(log)
  const log =await Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("uploadphoto", { log: log })

});
const upload = multer({ dest: 'photo/' }); 
app.post('/uploadpho2', upload.single('photo'), (req, res) => {
  fs.rename(req.file.path, 'path/to/save/' + req.file.originalname, (err) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      res.status(200).json({ message: 'File saved successfully!' });
  });
});
app.get('/aboutus', async (req, res) => {

  //const log = await managementlog.find();
  //console.log(log)
  const log = Status.find();
  //var log={};
  //log=[{"type": "Delete","devicename": "pump1", "username":"admin","action": "ON","time": "00"}]
  res.render("aboutus", { log: log })

});


app.get('/getenvs', async (req, res) => {
  const envs = await Env.findOne({});
  res.json(envs);
});
app.post('/sethum', (req, res) => {
  var data = ''
  req.on('data', chunk => {
    console.log('A chunk of data has arrived: ', chunk);
    data = data + chunk;
    console.log(data);
    hum = data;
  });
  req.on('end', () => {
    console.log('No more data');
  })
  res.sendStatus(200);
});

var mqtt = require('mqtt');
const { type } = require('os');

const MQTT_SERVER = "m15.cloudmqtt.com";
const MQTT_PORT = "12987";
//if your server don't have username and password let blank.
const MQTT_USER = "cyejnmdr";
const MQTT_PASSWORD = "Is7roaqnQX09";

// Connect MQTT
var client = mqtt.connect({
  host: MQTT_SERVER,
  port: MQTT_PORT,
  username: MQTT_USER,
  password: MQTT_PASSWORD
});

client.on('connect', function () {
  // Subscribe any topic
  console.log("MQTT Connect");
  client.subscribe('DT', function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe('waterserver', function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe('sprayserver', function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe('lightserver', function (err) {
    if (err) {
      console.log(err);
    }
  });
  client.subscribe('puiserver', function (err) {
    if (err) {
      console.log(err);
    }
  });
});



// Receive Message and print on terminal
client.on('message', async function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  var temp = ['1', '2', '3', '4', '5', '6', '7'];
  if (topic === "DT") {
    var temps = message.toString().split(",");
    axios.post('http://localhost:3002/envs', {
      humidity: temps[0],
      temperature: temps[1],
      EC: temps[2],
      PH: temps[3],
      n: temps[4],
      p: temps[5],
      k: temps[6]
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  else if (topic == "waterserver"){
    var waterbotton = message.toString();
    axios.post('http://localhost:3002/status',{
      device:"Water",
      status:waterbotton
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  else if (topic == "sprayserver"){
    var sprayserver = message.toString();
    axios.post('http://localhost:3002/status',{
      device:"Spray",
      status:sprayserver
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  else if (topic == "lightserver"){
    var lightserver = message.toString();
    axios.post('http://localhost:3002/status',{
      device:"Light",
      status:lightserver
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  else if (topic == "puiserver"){
    var puiserver = message.toString();
    axios.post('http://localhost:3002/status',{
      device:"fertilizer",
      status:puiserver
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  console.log(message.toString());
});


client.on('message', async function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  var temp = ['1', '2'];
  var temps = message.toString().split(",");
  axios.post('http://localhost:3002/setting', {
    device: temps[0],
    status: temps[1]
  })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  console.log(message.toString());
});


setInterval(() => {
  //client.publish("pump", "hello from NodeJS");
}, 5000);






app.use(express.json());
// mock data
const products = [{}];

app.post('/pump', async (req, res) => {
  const payload = req.body;

  var date_ob = new Date();
  /*const saveEnvs = new Env({
    status: payload.status,
    device: "pump",
    time: date_ob,
    
  })
  //const product = new Env(payload);
  await saveEnvs.save(); */
  //send MQTT broker;  publisher (nodejs)
  console.log(payload.status);

  client.publish("testiotsub1", payload.status, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })

  res.status(201).end();
});
app.post('/config', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveConfig = new Config({
    watertimer: payload.watertimer,
    puitimer: payload.puitimer,
    spraytimer: payload.spraytimer,
    lighttimer: payload.lighttimer,
    time: date_ob,
    type: payload.type

  })
  //const product = new Env(payload);
  await saveConfig.save();
  res.status(201).end();
});


app.post('/status', async (req, res) => {
  const payload = req.body;
  const message = JSON.stringify(payload)
  var date_ob = new Date();
  console.log(payload.payload);
  const saveStatus = new Status({
    device: payload.device,
    status: payload.status,
    time: date_ob

  })
  //const product = new Env(payload);
  client.publish("updatedevice", message, { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  })
  await saveStatus.save();
  res.status(201).end();
});

app.post('/envs', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  var date_ob = new Date();
  const saveEnvs = new Env({
    temperature: payload.temperature,
    humidity: payload.humidity,
    time: date_ob,
    EC: payload.EC,
    PH: payload.PH,
    n: payload.n,
    p: payload.p,
    k: payload.k,
    type: payload.type

  })
  //const product = new Env(payload);
  await saveEnvs.save();
  const query = {};
  const sort = { time: -1 };
  const limit = 1;
  const envs = await Env.find({}).sort(sort).limit(1);

  console.log(envs);
  var test = [{ "temperature": envs[0].temperature, "humidity": envs[0].humidity, "EC": envs[0].EC, "PH": envs[0].PH, "n": envs[0].n, "p": envs[0].p, "k": envs[0].k }];
  // client.publish("updatedevice", message, { qos: 0, retain: false }, (error) => {
  //   if (error) {
  //     console.error(error)
  //   }
  // })

  var statusAllJson = JSON.stringify(test);
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {

      console.log(statusAllJson);
      client.send(statusAllJson);

    }
  });


  res.status(201).end();
});


app.post("/ajax_updateWaterTimer", async (req, res) => {
  //console.log(req);
  console.log("EEEEEEEEEEEEEEEEEEEEEE =" + req.body.id);
  console.log("EEEEEEEEEEEEEEEEEEEEEE =" + req.body.waterTimer);
  try {

    const payload = req.body;
    console.log(payload);

    var date_ob = new Date();
    const saveConfig = new Config({
      watertimer: payload.watertimer,
      time: date_ob

    })
    await saveConfig.save();

    console.log("aaaaaaaaaaaaaaaaaaaaaaaa");

    return res.status(200).json({ status: true })
  } catch (error) {
    res.send("Set Status error");
  }
});






