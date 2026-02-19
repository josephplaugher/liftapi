import * as dotenv from 'dotenv';
import Lift from "src/models/Lift";
import LiftOption from "src/models/LiftOption";
import User from "src/models/User";
import { DataSourceOptions } from 'typeorm';
dotenv.config();

const AppDataSource: DataSourceOptions = {
    type: "postgres",
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT!),
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    // synchronize: true, // run migrations to handle schema updates ONLY IN DEV
    logging: false,
    entities: [Lift, LiftOption, User],
    subscribers: [],
    migrations: [],
}

export default AppDataSource;