import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm/dist/common";
import { DataSource } from "typeorm";
import Lift from "src/models/Lift";
import Pr from "src/models/Pr";

export type PrCheckResult = {
    newPr: boolean;
    weight?: number;
    liftName?: string;
};

@Injectable()
export default class PrService {
    constructor(@InjectDataSource() private readonly appDataSource: DataSource) { }

    async checkForNewPr(userId: string, lift: Lift): Promise<PrCheckResult> {
        const weight = Number(lift.Weight);
        if (!Number.isFinite(weight) || weight <= 0) {
            return { newPr: false };
        }
        // Loading a bar without completing a rep is not a record.
        if (!this.hasCompletedRep(lift)) {
            return { newPr: false };
        }

        const liftName = lift.Name;
        const existingPr = await this.appDataSource.manager.findOne(Pr, {
            where: { UserId: userId, LiftName: liftName },
        });

        // Without a stored record, fall back to logged history so lifters who
        // already have sets on file don't get a false record the first time.
        const previousBest = existingPr
            ? existingPr.Pr
            : await this.getBestLoggedWeight(userId, liftName, lift.Id);

        if (previousBest !== null && weight <= previousBest) {
            if (!existingPr) {
                await this.storePr(userId, liftName, previousBest);
            }
            return { newPr: false };
        }

        if (existingPr) {
            existingPr.Pr = weight;
            await this.appDataSource.manager.save(existingPr);
        } else {
            await this.storePr(userId, liftName, weight);
        }

        return { newPr: true, weight, liftName };
    }

    private hasCompletedRep(lift: Lift) {
        const reps = [lift.Set1, lift.Set2, lift.Set3, lift.Set4, lift.Set5];
        return reps.some((rep) => Number(rep) > 0);
    }

    private async getBestLoggedWeight(userId: string, liftName: string, excludeLiftId?: string) {
        const query = this.appDataSource.manager
            .createQueryBuilder(Lift, "lift")
            .select("MAX(lift.Weight)", "best")
            .where("lift.UserId = :userId", { userId })
            .andWhere("lift.Name = :liftName", { liftName });

        if (excludeLiftId) {
            query.andWhere("lift.Id != :excludeLiftId", { excludeLiftId });
        }

        const row = await query.getRawOne<{ best: string | number | null }>();
        return row?.best === null || row?.best === undefined ? null : Number(row.best);
    }

    private async storePr(userId: string, liftName: string, weight: number) {
        const pr = this.appDataSource.manager.create(Pr, {
            UserId: userId,
            LiftName: liftName,
            Pr: weight,
        });
        await this.appDataSource.manager.save(pr);
    }
}
