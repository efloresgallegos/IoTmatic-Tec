import pkg from 'pg';
const { Client } = pkg;
import {dbName, dbUser, dbPassword, dbHost, dbPort} from './database.js';


const createDatabaseAndTables = async () => {
    const client = new Client({
        user: dbUser,
        host: dbHost,
        password: dbPassword,
        port: dbPort,
        database: 'postgres', // Use a default database to create the target database
    });

    try {
        await client.connect();
        const dbExists = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            ['Framework']
        );

        if (dbExists.rowCount === 0) {
            await client.query(`CREATE DATABASE "Framework"`);
            console.log("Database 'Framework' created successfully!");
        } else {
            console.log("Database 'Framework' already exists.");
        }
        await client.end();

        // Connect to the target database
        const dbClient = new Client({
            user: dbUser,
            host: dbHost,
            database: dbName,
            password: dbPassword,
            port: dbPort,
        });

        await dbClient.connect();

        // Table creation
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(200) NOT NULL,
                username VARCHAR(50) NOT NULL
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS types (
                type_id SERIAL PRIMARY KEY,
                type VARCHAR(50) NOT NULL
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS models (
                model_id SERIAL PRIMARY KEY,
                modelName VARCHAR(100) NOT NULL
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS devices (
                device_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type_id INT,
                description VARCHAR(500) NOT NULL,
                FOREIGN KEY (type_id) REFERENCES types(type_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS deviceModels (
                deviceModels_id SERIAL PRIMARY KEY,
                device_id INT,
                model_id INT,
                FOREIGN KEY (device_id) REFERENCES devices(device_id),
                FOREIGN KEY (model_id) REFERENCES models(model_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS filters (
                filter_id SERIAL PRIMARY KEY,
                conditions JSONB NOT NULL,
                field VARCHAR(50) NOT NULL,
                device_id INT,
                model_id INT,
                FOREIGN KEY (device_id) REFERENCES devices(device_id),
                FOREIGN KEY (model_id) REFERENCES models(model_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                alert_id SERIAL PRIMARY KEY,
                device_id INT,
                model_id INT,
                description VARCHAR(500) NOT NULL,
                seen BOOLEAN DEFAULT FALSE,
                resolved BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (device_id) REFERENCES devices(device_id),
                FOREIGN KEY (model_id) REFERENCES models(model_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS userFilters (
                userFilters_id SERIAL PRIMARY KEY,
                filter_id INT,
                user_id INT,
                FOREIGN KEY (filter_id) REFERENCES filters(filter_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS userAlerts (
                userAlerts_id SERIAL PRIMARY KEY,
                user_id INT,
                alert_id INT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (alert_id) REFERENCES alerts(alert_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS userDevices (
                userDevices_id SERIAL PRIMARY KEY,
                user_id INT,
                device_id INT,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (device_id) REFERENCES devices(device_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS userModels (
                userModels_id SERIAL PRIMARY KEY,
                model_id INT,
                user_id INT,
                FOREIGN KEY (model_id) REFERENCES models(model_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        `);

        console.log("Tables created successfully!");
        await dbClient.end();
    } catch (err) {
        console.error("Error creating database and tables:", err.message);
    }
};

export default {
    createDatabaseAndTables,
};
