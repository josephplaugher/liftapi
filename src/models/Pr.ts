import { Entity, Column, PrimaryGeneratedColumn, Unique, Check } from "typeorm";

@Entity()
@Unique(["UserId", "LiftName"])
@Check("CHK_pr_lift_name_not_blank", `"LiftName" <> ''`)
export default class Pr {
    @PrimaryGeneratedColumn("uuid")
    Id: string;

    @Column({ type: 'uuid', nullable: false })
    UserId: string;

    @Column({ nullable: false })
    LiftName: string;

    @Column({ type: 'int', nullable: false })
    Pr: number;
}
