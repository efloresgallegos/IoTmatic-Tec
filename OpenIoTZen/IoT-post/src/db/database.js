import { Sequelize } from "sequelize";

export const dbName = process.env.DB_DATABASE;
export const dbUser = process.env.DB_USER;
export const dbPassword = process.env.DB_PASSWORD;
export const dbHost = process.env.DB_HOST;
export const dbPort = process.env.DB_PORT;

const sequelize = new Sequelize(
    dbName,
    dbUser,
    dbPassword,
    {
        host: dbHost,
        dialect: 'postgres',
    }
    );

export { sequelize };