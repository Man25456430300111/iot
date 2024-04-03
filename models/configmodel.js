const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  watertimer: String,
  puitimer: String,
  spraytimer: String,
  lighttimer: String,
  type:String,
  time:String
});

const ConfigModel = mongoose.model('config', ConfigSchema);

module.exports = ConfigModel;