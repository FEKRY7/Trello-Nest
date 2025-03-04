import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { Token } from "./token.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Token]),
        JwtModule
    ],
})
export class TokenModule {}