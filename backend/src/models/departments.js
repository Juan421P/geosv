import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Polygon', 'MultiPolygon'],
            required: true,
        },
        coordinates: {
            type: Array,
            required: true,
        },
    },
}, { timestamps: true });
schema.index({ geometry: '2dsphere' });
export default model('departments', schema);