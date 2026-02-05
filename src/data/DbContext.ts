// import { Injectable } from '@nestjs/common';
// import Lift from 'src/models/Lift';
// import LiftOption from 'src/models/LiftOption';
// import User from 'src/models/User';
// import { DataSource, Repository } from 'typeorm';

// @Injectable()
// export class DbContext {
//   constructor(private readonly dataSource: DataSource) {}

//   get users(): Repository<User> {
//     return this.dataSource.getRepository(User);
//   }

//   get lifts(): Repository<Lift> {
//     return this.dataSource.getRepository(Lift);
//   }

//   get liftOptions(): Repository<LiftOption> {
//     return this.dataSource.getRepository(LiftOption);
//   }

//   async transaction<T>(work: (db: DbContext) => Promise<T>) {
//     return this.dataSource.transaction(async manager => {
//       const txContext = new DbContext(manager.connection);
//       return work(txContext);
//     });
//   }
// }
