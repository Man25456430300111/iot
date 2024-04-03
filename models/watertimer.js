const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfigSchema = new Schema({
  watertimer: String,
  type:String
});

const ConfigModel = mongoose.model('watertimer', ConfigSchema);

module.exports = ConfigModel;