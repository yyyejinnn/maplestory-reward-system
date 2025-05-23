import { Injectable } from '@nestjs/common';
import {
  AuthPatterns,
  EventPatterns,
  RewardPatterns,
  RewardClaimPatterns,
  AuthUser,
  BaseRewardClaimFilterQuery,
} from '@app/common';
import { CreateEventReqDto } from './dto/post.create-event.req.dto';
import { RegisterReqDTO } from './dto/post.register.req.dto';
import { CreateRewardReqDto } from './dto/post.create-reward.req.dto';
import { CreateRewardClaimReqDto } from './dto/post.create-reward-claim.req.dto';
import { RpcClientService } from './rpc-client/rpc-client.service';
import { RewardClaimPolicyService } from './policies/reward-cliam.policy.service';

import { RewardClaimsFilterQueryDto } from './dto/get.list-reward-claims.filter-query.dto';
import { MyRewardClaimsFilterQueryDto } from './dto/get.my.list-reward-claims.filter-query.dto';

@Injectable()
export class GatewayService {
  constructor(
    private rpcClientService: RpcClientService,
    private claimPolicyService: RewardClaimPolicyService,
  ) {}

  // auth
  async register(dto: RegisterReqDTO) {
    return await this.rpcClientService.send(AuthPatterns.Register, dto, 'auth');
  }

  async login(user: AuthUser) {
    const payload = user;
    return await this.rpcClientService.send(AuthPatterns.CreateAccessToken, payload, 'auth');
  }

  // event
  async createEvent(dto: CreateEventReqDto, user: AuthUser) {
    const { id } = user;
    const payload = { ...dto, createdBy: id };

    return await this.rpcClientService.send(EventPatterns.CreateEvent, payload, 'event');
  }

  async listEvents() {
    return await this.rpcClientService.send(EventPatterns.ListEvents, {}, 'event');
  }

  async getEventById(id: string) {
    const payload = { id };

    return await this.rpcClientService.send(EventPatterns.GetEventById, payload, 'event');
  }

  // reward
  async createReward(dto: CreateRewardReqDto, user: AuthUser) {
    const { id } = user;

    const payload = { ...dto, createdBy: id };

    return await this.rpcClientService.send(RewardPatterns.CreateReward, payload, 'event');
  }

  async listRewards() {
    return await this.rpcClientService.send(RewardPatterns.ListRewards, {}, 'event');
  }

  async getRewardById(id: string) {
    const payload = { id };
    return await this.rpcClientService.send(RewardPatterns.GetRewardById, payload, 'event');
  }

  // claim
  async createRewardClaim(dto: CreateRewardClaimReqDto, user: AuthUser) {
    const { id: userId, email: userEmail, nickname: userNickname } = user;
    const { rewardId } = dto;

    const payload = { rewardId, userId, userEmail, userNickname };

    return await this.rpcClientService.send(
      RewardClaimPatterns.CreateRewardClaim,
      payload,
      'event',
    );
  }

  async listRewardClaims(query: RewardClaimsFilterQueryDto) {
    const payload = { query };

    return await this.rpcClientService.send(RewardClaimPatterns.ListRewardClaims, payload, 'event');
  }

  async listMyRewardClaims(query: MyRewardClaimsFilterQueryDto, user: AuthUser) {
    const rpcQuery: BaseRewardClaimFilterQuery = { ...query, userId: user.id };

    const payload = { query: rpcQuery };

    return await this.rpcClientService.send(RewardClaimPatterns.ListRewardClaims, payload, 'event');
  }

  async getRewardClaimById(id: string) {
    return await this.sendEventRewardClaimMessage(id);
  }

  async getMyRewardClaimById(id: string, user: AuthUser) {
    const claim = await this.sendEventRewardClaimMessage(id);

    this.claimPolicyService.assertViewOwnerClaim(user, claim);

    return claim;
  }

  private async sendEventRewardClaimMessage(claimId: string) {
    const payload = { id: claimId };

    return await this.rpcClientService.send(
      RewardClaimPatterns.GetRewardClaimById,
      payload,
      'event',
    );
  }
}
