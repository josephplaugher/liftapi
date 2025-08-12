# Lift API 
## React + TypeScript + NestJS + TypeORM
A REST api to support [Lift](https://github.com/josephplaugher/lift). Built with typescript using the [NestJs](https://nestjs.org) framework.
This app is configured to use [TypeORM](https://typeorm.io/) for database access, which is much like using Entity Framework with .NET, but it's for TypeScript.

## To run
Download the repo. 
npm i, or pnpm i, or yarn install.<br/>
Create a .env file, and add the following database connection details for your desired connection.<br/>
<pre>PG_HOST=[url for your database. Probably localhost if developing locally]
PG_PORT=[port number for your database host]
PG_USERNAME=[username for database connection]
PG_PASSWORD=[password for database connection]
PG_DATABASE=[database name]</pre>

npm run start:dev, pnpm run start:dev, or yarn run start:dev.<br/>
You can use this as a backend, and bring your own front end, or use [Lift](https://github.com/josephplaugher/lift) as the front end.


