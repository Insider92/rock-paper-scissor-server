import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { concatMap } from 'rxjs';
import { Repository } from 'typeorm';
import { ChoiceEntity } from '../choice/entity/choice.entity';
import { CreateMatchDto } from './dto/createMatch.dto';
import { MatchDto } from './dto/match.dto';
import { MatchEntity } from './entity/match.entity';
import { OpponentType } from './enum/opponentType.enum';
import { Result } from './enum/result.enum';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(MatchEntity)
        private readonly matchRepository: Repository<MatchEntity>,
        @InjectRepository(ChoiceEntity)
        private choiceRepository: Repository<ChoiceEntity>,
    ) { }

    async getAll(): Promise<MatchDto[]> {
        return await this.matchRepository.find({
            relations: [
                'challenger',
                'challengedUser',
                'challengerChoice',
                'challengedChoice',
            ],
        });
    }

    async choiceExists(match: CreateMatchDto): Promise<ChoiceEntity> {
        return await this.choiceRepository.findOne({ where: { id: match.choice.toString() } });
    }

    async createMatch(match: CreateMatchDto): Promise<MatchDto> {
        const matchObject = {
            challengerUser: null, // TO-DO with Auth req.user
            challengerChoice: match.choice,
            challengedUser: match?.challengedUser,
            opponentType: !match.challengedUser ? OpponentType.COMPUTER : OpponentType.HUMAN
        }

        if (matchObject.opponentType === OpponentType.COMPUTER) {
            const computersChoice = await this._getComputersChoice();
            const matchResult = await this._getMatchResult(matchObject.challengerChoice.toString(), computersChoice)
            matchObject['challengedChoice'] = computersChoice;
            matchObject['result'] = matchResult;
        }

        const matchToBeCreated = this.matchRepository.create(matchObject);
        return await this.matchRepository.save(matchToBeCreated);
    };

    async _getComputersChoice(): Promise<string> {
        const randomChoiceId = await this.choiceRepository
            .createQueryBuilder('choice')
            .select('id')
            .orderBy('RAND()') // Works only in mysql
            .limit(1)
            .execute();
        return randomChoiceId[0].id;
    }

    async _getMatchResult(challengerChoice: string, challengedChoice: string): Promise<Result> {

        if (challengerChoice === challengedChoice)
            return Result.DRAW;

        const choice = await this.choiceRepository.findOne({ where: { id: challengerChoice }, relations: ['getsBeatenBy'] });
        const getsBeatenBy = choice.getsBeatenBy.find(choice => choice.id === challengedChoice) 
        
        if(!getsBeatenBy){
            return Result.CHALLENGER_WIN
        }

        return Result.CHALLENGED_WIN;
    }
}
