import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { CreateEventReqDto } from './dto/post.create-event.req.dto';
import { RegisterReqDTO } from './dto/post.register.req.dto';
import { CreateRewardReqDto } from './dto/post.create-reward.req.dto';
import { CreateRewardClaimReqDto } from './dto/post.create-reward-claim.req.dto';
import { LocalAuthGuard } from './passport/local/local.guard';
import { User } from './decorators/user.decorator';
import { AuthUser, BaseUser } from '@app/common';
import { Roles } from './role/role.decorator';
import { UserRole } from '@app/common/enums/user-role.enum';
import { RewardClaimsFilterQueryDto } from './dto/get.list-reward-claims.filter-query.dto';
import { MyRewardClaimsFilterQueryDto } from './dto/get.my.list-reward-claims.filter-query.dto';
import { Public } from './decorators/public.decorator';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  //auth
  @Public()
  @Post('/auth/register')
  async register(@Body() dto: RegisterReqDTO) {
    return await this.gatewayService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/auth/login')
  async login(@User() user: BaseUser) {
    return await this.gatewayService.login(user);
  }

  // event - events
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post('/events')
  async createEvent(@Body() dto: CreateEventReqDto, @User() user: AuthUser) {
    return await this.gatewayService.createEvent(dto, user);
  }

  @Get('/events')
  async listEvents() {
    return await this.gatewayService.listEvents();
  }

  @Get('/events/:id')
  async getEventById(@Param('id') id: string) {
    return this.gatewayService.getEventById(id);
  }

  // event - rewards
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @Post('/rewards')
  async createReward(@Body() dto: CreateRewardReqDto, @User() user: AuthUser) {
    return await this.gatewayService.createReward(dto, user);
  }

  @Get('/rewards')
  async listRewards() {
    return await this.gatewayService.listRewards();
  }

  @Get('/rewards/:id')
  async getRewardById(@Param('id') id: string) {
    return this.gatewayService.getRewardById(id);
  }

  // event - claims
  @Roles(UserRole.USER)
  @Post('/reward-claims')
  async createRewardClaim(@Body() dto: CreateRewardClaimReqDto, @User() user: AuthUser) {
    return await this.gatewayService.createRewardClaim(dto, user);
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR)
  @Get('/reward-claims')
  async listRewardClaims(@Query() query: RewardClaimsFilterQueryDto) {
    return this.gatewayService.listRewardClaims(query);
  }

  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR)
  @Get('/reward-claims/:id')
  async getRewardClaimById(@Param('id') id: string) {
    return this.gatewayService.getRewardClaimById(id);
  }

  // 유저용
  @Roles(UserRole.USER)
  @Get('/my/reward-claims')
  async listMyRewardClaims(@Query() query: MyRewardClaimsFilterQueryDto, @User() user: AuthUser) {
    return this.gatewayService.listMyRewardClaims(query, user);
  }

  @Roles(UserRole.USER)
  @Get('/my/reward-claims/:id')
  async getMyRewardClaimById(@Param('id') id: string, @User() user: AuthUser) {
    // claimId url 노출 -> 소유권 확인 필요
    return this.gatewayService.getMyRewardClaimById(id, user);
  }
}
