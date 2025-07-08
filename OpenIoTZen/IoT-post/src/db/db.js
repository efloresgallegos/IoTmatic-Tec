import pkg from 'pg';
const { Client } = pkg;
import { dbName, dbUser, dbPassword, dbHost, dbPort } from './database.js';

const createDatabaseAndTables = async () => {
    const client = new Client({
        user: dbUser,
        host: dbHost,
        password: dbPassword,
        port: dbPort,
        database: 'postgres'
    });

    try {
        await client.connect();
        const dbExists = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (dbExists.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully!`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
        await client.end();

        // Conectar a la base de datos creada
        const dbClient = new Client({
            user: dbUser,
            host: dbHost,
            database: dbName,
            password: dbPassword,
            port: dbPort,
        });

        await dbClient.connect();

        // Crear tablas en orden correcto
        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                password VARCHAR(200) NOT NULL,
                username VARCHAR(50) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS types (
                type_id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS models (
                model_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS devices (
                device_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type_id INTEGER REFERENCES types(type_id) ON DELETE SET NULL,
                description VARCHAR(500) NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS device_models (
                device_model_id SERIAL PRIMARY KEY,
                device_id INTEGER NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
                model_id INTEGER NOT NULL REFERENCES models(model_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(device_id, model_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS filters (
                filter_id SERIAL PRIMARY KEY,
                conditions JSONB NOT NULL,
                field VARCHAR(50) NOT NULL,
                filter_type VARCHAR(20) NOT NULL DEFAULT 'numeric',
                device_id INTEGER REFERENCES devices(device_id) ON DELETE CASCADE,
                model_id INTEGER REFERENCES models(model_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT filter_type_check CHECK (filter_type IN ('numeric', 'boolean', 'string'))
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS alerts (
                alert_id SERIAL PRIMARY KEY,
                device_id INTEGER REFERENCES devices(device_id) ON DELETE CASCADE,
                model_id INTEGER REFERENCES models(model_id) ON DELETE CASCADE,
                description VARCHAR(500) NOT NULL,
                seen BOOLEAN DEFAULT FALSE,
                resolved BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS user_filters (
                user_filter_id SERIAL PRIMARY KEY,
                filter_id INTEGER NOT NULL REFERENCES filters(filter_id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(filter_id, user_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS user_alerts (
                user_alert_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                alert_id INTEGER NOT NULL REFERENCES alerts(alert_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, alert_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS user_devices (
                user_device_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                device_id INTEGER NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, device_id)
            )
        `);

        await dbClient.query(`
            CREATE TABLE IF NOT EXISTS user_models (
                user_model_id SERIAL PRIMARY KEY,
                model_id INTEGER NOT NULL REFERENCES models(model_id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(model_id, user_id)
            )
        `);

        console.log("¡Tablas creadas exitosamente!");

        // Crear usuario administrador por defecto
        try {
            const adminExists = await dbClient.query(
                `SELECT 1 FROM users WHERE username = 'admin'`
            );

            if (adminExists.rowCount === 0) {
                const bcrypt = await import('bcrypt');
                const salt = await bcrypt.default.genSalt(10);
                const hashedPassword = await bcrypt.default.hash('admin123', salt);

                await dbClient.query(
                    `INSERT INTO users (name, password, username) VALUES ($1, $2, $3)`,
                    ['Administrador', hashedPassword, 'admin']
                );
                console.log('Usuario administrador creado con éxito!');
            } else {
                console.log('El usuario administrador ya existe.');
            }
        } catch (error) {
            console.error('Error al crear usuario administrador:', error.message);
        }

        await dbClient.end();
    } catch (err) {
        console.error("Error al crear la base de datos y las tablas:", err.message);
    }
};

export default {
    createDatabaseAndTables,
};