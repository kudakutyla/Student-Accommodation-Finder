import dotenv from 'dotenv';

dotenv.config();

// Keep Jest output focused on assertions/failures rather than app request logs.
jest.setTimeout(20000);
