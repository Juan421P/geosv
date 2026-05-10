import { Schema, model } from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['calle', 'avenida', 'carretera', 'bulevar', 'alameda', 'pasaje', 'senda'],
        required: true
    },
    municipality: {
        type: Schema.Types.ObjectId,
        ref: 'municipalities',
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['LineString'],
            required: true
        },
        coordinates: {
            type: [[Number]],
            required: true
        }
    }
});
schema.index({ name: 1, type: 1, municipality: 1 });
schema.index({ geometry: '2dsphere' });
export default model('streets', schema);