import { Schema, model } from 'mongoose';
const schema = new Schema({
    point: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    department_id: {
        type: Schema.Types.ObjectId,
        ref: 'departments',
        required: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    municipality_id: {
        type: Schema.Types.ObjectId,
        ref: 'municipalities',
        required: true
    },
    municipality: {
        type: String,
        required: true,
        trim: true
    },
    district_id: {
        type: Schema.Types.ObjectId,
        ref: 'districts',
        required: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    settlement_id: {
        type: Schema.Types.ObjectId,
        ref: 'settlements',
        default: null
    },
    settlement: {
        type: String,
        default: null,
        trim: true
    },
    street_id: {
        type: Schema.Types.ObjectId,
        ref: 'streets',
        required: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    }
});
schema.index({ point: '2dsphere' });
export default model('addresses', schema);