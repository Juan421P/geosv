import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'departments',
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Polygon', 'MultiPolygon'],
            required: true
        },
        coordinates: {
            type: Array,
            required: true
        }
    }
});
schema.index({ name: 1, department: 1 }, { unique: true });
schema.index({ geometry: '2dsphere' });
export default model('municipalities', schema);