const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  quantity: String,
  type:String
});

const StatusModel = mongoose.model('Fertilze', statusSchema);

module.exports = StatusModel;