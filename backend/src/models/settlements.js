import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    municipality: {
        type: Schema.Types.ObjectId,
        ref: 'municipalities',
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
schema.index({ name: 1, type: 1, municipality: 1 }, { unique: true });
schema.index({ geometry: '2dsphere' });
export default model('settlements', schema);