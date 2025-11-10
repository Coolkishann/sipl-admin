import mongoose from 'mongoose';
const CounterSchema = new mongoose.Schema({
  name: String,
  seq: Number
});
const Counter = mongoose.model('Counter', CounterSchema);
export default Counter;
