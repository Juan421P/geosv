import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../config.js';
import { departments } from './departments.js';
import { municipalities } from './municipalities.js';
import { districts } from './districts.js';
import { subdistricts } from './subdistricts.js';
import { settlements } from './settlements.js';
import { streets } from './streets.js';
const run = async () => {
    try {
        console.log('connecting to mongodb...');
        await mongoose.connect(config.db.URI);
        console.log('connected');
        console.log('wiping old data...');
        await mongoose.connection.db.dropDatabase();
        console.log('seeding data...');
        await departments();
        await municipalities();
        await districts();
        await subdistricts();
        await settlements();
        await streets();
        console.log('seeding completed.');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('seeding failed:', error);
        process.exit(1);
    }
};
run();