import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';
import Lift from "src/models/Lift";
import LiftOption from "src/models/LiftOption";
import User from "src/models/User";
dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT!),
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    synchronize: false, // run migrations to handle schema updates
    logging: false,
    entities: [Lift, LiftOption, User],
    subscribers: [],
    migrations: [],
})

// uncomment this and run the app to update migrations

AppDataSource.initialize()
    .then((result: DataSource) => {
        // console.log(result)
        // here you can start to work with your database
    })
    .catch((error) => console.log(error));

export default AppDataSource;