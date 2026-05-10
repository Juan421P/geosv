import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: Schema.Types.ObjectId,
        ref: 'districts',
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
schema.index({ name: 1, district: 1 }, { unique: true });
schema.index({ geometry: '2dsphere' });
export default model('subdistricts', schema);