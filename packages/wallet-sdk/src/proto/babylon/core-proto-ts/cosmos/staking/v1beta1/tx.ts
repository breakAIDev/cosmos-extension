import { Decimal } from '@cosmjs/math';
import { decodePubkey, encodePubkey } from '@cosmjs/proto-signing';

import { BinaryReader, BinaryWriter } from '../../../../../binary';
import { Any, AnyAmino, AnySDKType } from '../../../../../google/protobuf/any';
import { Timestamp } from '../../../../../google/protobuf/timestamp';
import { fromTimestamp, toTimestamp } from '../../../../../helpers';
import { Coin, CoinAmino, CoinSDKType } from '../../base/v1beta1/coin';
import {
  CommissionRates,
  CommissionRatesAmino,
  CommissionRatesSDKType,
  Description,
  DescriptionAmino,
  DescriptionSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from './staking';
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidator {
  description: Description;
  commission: CommissionRates;
  minSelfDelegation: string;
  delegatorAddress: string;
  validatorAddress: string;
  pubkey?: Any;
  value: Coin;
}
export interface MsgCreateValidatorProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator';
  value: Uint8Array;
}
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidatorAmino {
  description?: DescriptionAmino;
  commission?: CommissionRatesAmino;
  min_self_delegation?: string;
  delegator_address?: string;
  validator_address?: string;
  pubkey?: AnyAmino;
  value?: CoinAmino;
}
export interface MsgCreateValidatorAminoMsg {
  type: 'cosmos-sdk/MsgCreateValidator';
  value: MsgCreateValidatorAmino;
}
/** MsgCreateValidator defines a SDK message for creating a new validator. */
export interface MsgCreateValidatorSDKType {
  description: DescriptionSDKType;
  commission: CommissionRatesSDKType;
  min_self_delegation: string;
  delegator_address: string;
  validator_address: string;
  pubkey?: AnySDKType;
  value: CoinSDKType;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponse {}
export interface MsgCreateValidatorResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidatorResponse';
  value: Uint8Array;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponseAmino {}
export interface MsgCreateValidatorResponseAminoMsg {
  type: 'cosmos-sdk/MsgCreateValidatorResponse';
  value: MsgCreateValidatorResponseAmino;
}
/** MsgCreateValidatorResponse defines the Msg/CreateValidator response type. */
export interface MsgCreateValidatorResponseSDKType {}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidator {
  description: Description;
  validatorAddress: string;
  /**
   * We pass a reference to the new commission rate and min self delegation as
   * it's not mandatory to update. If not updated, the deserialized rate will be
   * zero with no way to distinguish if an update was intended.
   * REF: #2373
   */
  commissionRate: string;
  minSelfDelegation: string;
}
export interface MsgEditValidatorProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator';
  value: Uint8Array;
}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidatorAmino {
  description?: DescriptionAmino;
  validator_address?: string;
  /**
   * We pass a reference to the new commission rate and min self delegation as
   * it's not mandatory to update. If not updated, the deserialized rate will be
   * zero with no way to distinguish if an update was intended.
   * REF: #2373
   */
  commission_rate?: string;
  min_self_delegation?: string;
}
export interface MsgEditValidatorAminoMsg {
  type: 'cosmos-sdk/MsgEditValidator';
  value: MsgEditValidatorAmino;
}
/** MsgEditValidator defines a SDK message for editing an existing validator. */
export interface MsgEditValidatorSDKType {
  description: DescriptionSDKType;
  validator_address: string;
  commission_rate: string;
  min_self_delegation: string;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponse {}
export interface MsgEditValidatorResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgEditValidatorResponse';
  value: Uint8Array;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponseAmino {}
export interface MsgEditValidatorResponseAminoMsg {
  type: 'cosmos-sdk/MsgEditValidatorResponse';
  value: MsgEditValidatorResponseAmino;
}
/** MsgEditValidatorResponse defines the Msg/EditValidator response type. */
export interface MsgEditValidatorResponseSDKType {}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
}
export interface MsgDelegateProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate';
  value: Uint8Array;
}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegateAmino {
  delegator_address?: string;
  validator_address?: string;
  amount?: CoinAmino;
}
export interface MsgDelegateAminoMsg {
  type: 'cosmos-sdk/MsgDelegate';
  value: MsgDelegateAmino;
}
/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount: CoinSDKType;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponse {}
export interface MsgDelegateResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegateResponse';
  value: Uint8Array;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponseAmino {}
export interface MsgDelegateResponseAminoMsg {
  type: 'cosmos-sdk/MsgDelegateResponse';
  value: MsgDelegateResponseAmino;
}
/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponseSDKType {}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegate {
  delegatorAddress: string;
  validatorSrcAddress: string;
  validatorDstAddress: string;
  amount: Coin;
}
export interface MsgBeginRedelegateProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate';
  value: Uint8Array;
}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegateAmino {
  delegator_address?: string;
  validator_src_address?: string;
  validator_dst_address?: string;
  amount?: CoinAmino;
}
export interface MsgBeginRedelegateAminoMsg {
  type: 'cosmos-sdk/MsgBeginRedelegate';
  value: MsgBeginRedelegateAmino;
}
/**
 * MsgBeginRedelegate defines a SDK message for performing a redelegation
 * of coins from a delegator and source validator to a destination validator.
 */
export interface MsgBeginRedelegateSDKType {
  delegator_address: string;
  validator_src_address: string;
  validator_dst_address: string;
  amount: CoinSDKType;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponse {
  completionTime: Date;
}
export interface MsgBeginRedelegateResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegateResponse';
  value: Uint8Array;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponseAmino {
  completion_time: string;
}
export interface MsgBeginRedelegateResponseAminoMsg {
  type: 'cosmos-sdk/MsgBeginRedelegateResponse';
  value: MsgBeginRedelegateResponseAmino;
}
/** MsgBeginRedelegateResponse defines the Msg/BeginRedelegate response type. */
export interface MsgBeginRedelegateResponseSDKType {
  completion_time: Date;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegate {
  delegatorAddress: string;
  validatorAddress: string;
  amount: Coin;
}
export interface MsgUndelegateProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate';
  value: Uint8Array;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegateAmino {
  delegator_address?: string;
  validator_address?: string;
  amount?: CoinAmino;
}
export interface MsgUndelegateAminoMsg {
  type: 'cosmos-sdk/MsgUndelegate';
  value: MsgUndelegateAmino;
}
/**
 * MsgUndelegate defines a SDK message for performing an undelegation from a
 * delegate and a validator.
 */
export interface MsgUndelegateSDKType {
  delegator_address: string;
  validator_address: string;
  amount: CoinSDKType;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponse {
  completionTime: Date;
  /** amount returns the amount of undelegated coins */
  amount: Coin;
}
export interface MsgUndelegateResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegateResponse';
  value: Uint8Array;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponseAmino {
  completion_time: string;
  /** amount returns the amount of undelegated coins */
  amount: CoinAmino;
}
export interface MsgUndelegateResponseAminoMsg {
  type: 'cosmos-sdk/MsgUndelegateResponse';
  value: MsgUndelegateResponseAmino;
}
/** MsgUndelegateResponse defines the Msg/Undelegate response type. */
export interface MsgUndelegateResponseSDKType {
  completion_time: Date;
  amount: CoinSDKType;
}
/** MsgCancelUnbondingDelegation defines the SDK message for performing a cancel unbonding delegation for delegator */
export interface MsgCancelUnbondingDelegation {
  delegatorAddress: string;
  validatorAddress: string;
  /** amount is always less than or equal to unbonding delegation entry balance */
  amount: Coin;
  /** creation_height is the height which the unbonding took place. */
  creationHeight: bigint;
}
export interface MsgCancelUnbondingDelegationProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation';
  value: Uint8Array;
}
/** MsgCancelUnbondingDelegation defines the SDK message for performing a cancel unbonding delegation for delegator */
export interface MsgCancelUnbondingDelegationAmino {
  delegator_address?: string;
  validator_address?: string;
  /** amount is always less than or equal to unbonding delegation entry balance */
  amount: CoinAmino;
  /** creation_height is the height which the unbonding took place. */
  creation_height?: string;
}
export interface MsgCancelUnbondingDelegationAminoMsg {
  type: 'cosmos-sdk/MsgCancelUnbondingDelegation';
  value: MsgCancelUnbondingDelegationAmino;
}
/** MsgCancelUnbondingDelegation defines the SDK message for performing a cancel unbonding delegation for delegator */
export interface MsgCancelUnbondingDelegationSDKType {
  delegator_address: string;
  validator_address: string;
  amount: CoinSDKType;
  creation_height: bigint;
}
/** MsgCancelUnbondingDelegationResponse */
export interface MsgCancelUnbondingDelegationResponse {}
export interface MsgCancelUnbondingDelegationResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegationResponse';
  value: Uint8Array;
}
/** MsgCancelUnbondingDelegationResponse */
export interface MsgCancelUnbondingDelegationResponseAmino {}
export interface MsgCancelUnbondingDelegationResponseAminoMsg {
  type: 'cosmos-sdk/MsgCancelUnbondingDelegationResponse';
  value: MsgCancelUnbondingDelegationResponseAmino;
}
/** MsgCancelUnbondingDelegationResponse */
export interface MsgCancelUnbondingDelegationResponseSDKType {}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParams {
  /** authority is the address that controls the module (defaults to x/gov unless overwritten). */
  authority: string;
  /**
   * params defines the x/staking parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: Params;
}
export interface MsgUpdateParamsProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParams';
  value: Uint8Array;
}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParamsAmino {
  /** authority is the address that controls the module (defaults to x/gov unless overwritten). */
  authority?: string;
  /**
   * params defines the x/staking parameters to update.
   *
   * NOTE: All parameters must be supplied.
   */
  params: ParamsAmino;
}
export interface MsgUpdateParamsAminoMsg {
  type: 'cosmos-sdk/x/staking/MsgUpdateParams';
  value: MsgUpdateParamsAmino;
}
/** MsgUpdateParams is the Msg/UpdateParams request type. */
export interface MsgUpdateParamsSDKType {
  authority: string;
  params: ParamsSDKType;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponse {}
export interface MsgUpdateParamsResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParamsResponse';
  value: Uint8Array;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponseAmino {}
export interface MsgUpdateParamsResponseAminoMsg {
  type: 'cosmos-sdk/MsgUpdateParamsResponse';
  value: MsgUpdateParamsResponseAmino;
}
/**
 * MsgUpdateParamsResponse defines the response structure for executing a
 * MsgUpdateParams message.
 */
export interface MsgUpdateParamsResponseSDKType {}
/** MsgRotateConsPubKey is the Msg/RotateConsPubKey request type. */
export interface MsgRotateConsPubKey {
  validatorAddress: string;
  newPubkey?: Any;
}
export interface MsgRotateConsPubKeyProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKey';
  value: Uint8Array;
}
/** MsgRotateConsPubKey is the Msg/RotateConsPubKey request type. */
export interface MsgRotateConsPubKeyAmino {
  validator_address?: string;
  new_pubkey?: AnyAmino;
}
export interface MsgRotateConsPubKeyAminoMsg {
  type: 'cosmos-sdk/MsgRotateConsPubKey';
  value: MsgRotateConsPubKeyAmino;
}
/** MsgRotateConsPubKey is the Msg/RotateConsPubKey request type. */
export interface MsgRotateConsPubKeySDKType {
  validator_address: string;
  new_pubkey?: AnySDKType;
}
/**
 * MsgRotateConsPubKeyResponse defines the response structure for executing a
 * MsgRotateConsPubKey message.
 */
export interface MsgRotateConsPubKeyResponse {}
export interface MsgRotateConsPubKeyResponseProtoMsg {
  typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKeyResponse';
  value: Uint8Array;
}
/**
 * MsgRotateConsPubKeyResponse defines the response structure for executing a
 * MsgRotateConsPubKey message.
 */
export interface MsgRotateConsPubKeyResponseAmino {}
export interface MsgRotateConsPubKeyResponseAminoMsg {
  type: 'cosmos-sdk/MsgRotateConsPubKeyResponse';
  value: MsgRotateConsPubKeyResponseAmino;
}
/**
 * MsgRotateConsPubKeyResponse defines the response structure for executing a
 * MsgRotateConsPubKey message.
 */
export interface MsgRotateConsPubKeyResponseSDKType {}
function createBaseMsgCreateValidator(): MsgCreateValidator {
  return {
    description: Description.fromPartial({}),
    commission: CommissionRates.fromPartial({}),
    minSelfDelegation: '',
    delegatorAddress: '',
    validatorAddress: '',
    pubkey: undefined,
    value: Coin.fromPartial({}),
  };
}
export const MsgCreateValidator = {
  typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
  encode(message: MsgCreateValidator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.description !== undefined) {
      Description.encode(message.description, writer.uint32(10).fork()).ldelim();
    }
    if (message.commission !== undefined) {
      CommissionRates.encode(message.commission, writer.uint32(18).fork()).ldelim();
    }
    if (message.minSelfDelegation !== '') {
      writer.uint32(26).string(message.minSelfDelegation);
    }
    if (message.delegatorAddress !== '') {
      writer.uint32(34).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(42).string(message.validatorAddress);
    }
    if (message.pubkey !== undefined) {
      Any.encode(message.pubkey, writer.uint32(50).fork()).ldelim();
    }
    if (message.value !== undefined) {
      Coin.encode(message.value, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateValidator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 2:
          message.commission = CommissionRates.decode(reader, reader.uint32());
          break;
        case 3:
          message.minSelfDelegation = reader.string();
          break;
        case 4:
          message.delegatorAddress = reader.string();
          break;
        case 5:
          message.validatorAddress = reader.string();
          break;
        case 6:
          message.pubkey = Any.decode(reader, reader.uint32());
          break;
        case 7:
          message.value = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateValidator>): MsgCreateValidator {
    const message = createBaseMsgCreateValidator();
    
    
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    
    
    message.commission =
      object.commission !== undefined && object.commission !== null
        ? CommissionRates.fromPartial(object.commission)
        : undefined;
    message.minSelfDelegation = object.minSelfDelegation ?? '';
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    message.pubkey = object.pubkey !== undefined && object.pubkey !== null ? Any.fromPartial(object.pubkey) : undefined;
    
    
    message.value = object.value !== undefined && object.value !== null ? Coin.fromPartial(object.value) : undefined;
    return message;
  },
  fromAmino(object: MsgCreateValidatorAmino): MsgCreateValidator {
    const message = createBaseMsgCreateValidator();
    if (object.description !== undefined && object.description !== null) {
      message.description = Description.fromAmino(object.description);
    }
    if (object.commission !== undefined && object.commission !== null) {
      message.commission = CommissionRates.fromAmino(object.commission);
    }
    if (object.min_self_delegation !== undefined && object.min_self_delegation !== null) {
      message.minSelfDelegation = object.min_self_delegation;
    }
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.pubkey !== undefined && object.pubkey !== null) {
      message.pubkey = encodePubkey(object.pubkey);
    }
    if (object.value !== undefined && object.value !== null) {
      message.value = Coin.fromAmino(object.value);
    }
    return message;
  },
  toAmino(message: MsgCreateValidator): MsgCreateValidatorAmino {
    const obj: any = {};
    obj.description = message.description
      ? Description.toAmino(message.description)
      : Description.toAmino(Description.fromPartial({}));
    obj.commission = message.commission
      ? CommissionRates.toAmino(message.commission)
      : CommissionRates.toAmino(CommissionRates.fromPartial({}));
    obj.min_self_delegation = message.minSelfDelegation ?? '';
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.pubkey = message.pubkey ? decodePubkey(message.pubkey) : undefined;
    obj.value = message.value ? Coin.toAmino(message.value) : Coin.toAmino(Coin.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgCreateValidatorAminoMsg): MsgCreateValidator {
    return MsgCreateValidator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateValidator): MsgCreateValidatorAminoMsg {
    return {
      type: 'cosmos-sdk/MsgCreateValidator',
      value: MsgCreateValidator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateValidatorProtoMsg): MsgCreateValidator {
    return MsgCreateValidator.decode(message.value);
  },
  toProto(message: MsgCreateValidator): Uint8Array {
    return MsgCreateValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateValidator): MsgCreateValidatorProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidator',
      value: MsgCreateValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateValidatorResponse(): MsgCreateValidatorResponse {
  return {};
}
export const MsgCreateValidatorResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidatorResponse',
  encode(_: MsgCreateValidatorResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateValidatorResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateValidatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCreateValidatorResponse>): MsgCreateValidatorResponse {
    const message = createBaseMsgCreateValidatorResponse();
    return message;
  },
  fromAmino(_: MsgCreateValidatorResponseAmino): MsgCreateValidatorResponse {
    const message = createBaseMsgCreateValidatorResponse();
    return message;
  },
  toAmino(_: MsgCreateValidatorResponse): MsgCreateValidatorResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCreateValidatorResponseAminoMsg): MsgCreateValidatorResponse {
    return MsgCreateValidatorResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateValidatorResponse): MsgCreateValidatorResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgCreateValidatorResponse',
      value: MsgCreateValidatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateValidatorResponseProtoMsg): MsgCreateValidatorResponse {
    return MsgCreateValidatorResponse.decode(message.value);
  },
  toProto(message: MsgCreateValidatorResponse): Uint8Array {
    return MsgCreateValidatorResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateValidatorResponse): MsgCreateValidatorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgCreateValidatorResponse',
      value: MsgCreateValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgEditValidator(): MsgEditValidator {
  return {
    description: Description.fromPartial({}),
    validatorAddress: '',
    commissionRate: '',
    minSelfDelegation: '',
  };
}
export const MsgEditValidator = {
  typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
  encode(message: MsgEditValidator, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.description !== undefined) {
      Description.encode(message.description, writer.uint32(10).fork()).ldelim();
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.commissionRate !== '') {
      writer.uint32(26).string(Decimal.fromUserInput(message.commissionRate, 18).atomics);
    }
    if (message.minSelfDelegation !== '') {
      writer.uint32(34).string(message.minSelfDelegation);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEditValidator {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.description = Description.decode(reader, reader.uint32());
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.commissionRate = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        case 4:
          message.minSelfDelegation = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgEditValidator>): MsgEditValidator {
    const message = createBaseMsgEditValidator();
    
    
    message.description =
      object.description !== undefined && object.description !== null
        ? Description.fromPartial(object.description)
        : undefined;
    message.validatorAddress = object.validatorAddress ?? '';
    message.commissionRate = object.commissionRate ?? '';
    message.minSelfDelegation = object.minSelfDelegation ?? '';
    return message;
  },
  fromAmino(object: MsgEditValidatorAmino): MsgEditValidator {
    const message = createBaseMsgEditValidator();
    if (object.description !== undefined && object.description !== null) {
      message.description = Description.fromAmino(object.description);
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.commission_rate !== undefined && object.commission_rate !== null) {
      message.commissionRate = object.commission_rate;
    }
    if (object.min_self_delegation !== undefined && object.min_self_delegation !== null) {
      message.minSelfDelegation = object.min_self_delegation;
    }
    return message;
  },
  toAmino(message: MsgEditValidator): MsgEditValidatorAmino {
    const obj: any = {};
    obj.description = message.description
      ? Description.toAmino(message.description)
      : Description.toAmino(Description.fromPartial({}));
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.commission_rate = message.commissionRate === '' ? undefined : message.commissionRate;
    obj.min_self_delegation = message.minSelfDelegation === '' ? undefined : message.minSelfDelegation;
    return obj;
  },
  fromAminoMsg(object: MsgEditValidatorAminoMsg): MsgEditValidator {
    return MsgEditValidator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgEditValidator): MsgEditValidatorAminoMsg {
    return {
      type: 'cosmos-sdk/MsgEditValidator',
      value: MsgEditValidator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgEditValidatorProtoMsg): MsgEditValidator {
    return MsgEditValidator.decode(message.value);
  },
  toProto(message: MsgEditValidator): Uint8Array {
    return MsgEditValidator.encode(message).finish();
  },
  toProtoMsg(message: MsgEditValidator): MsgEditValidatorProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgEditValidator',
      value: MsgEditValidator.encode(message).finish(),
    };
  },
};
function createBaseMsgEditValidatorResponse(): MsgEditValidatorResponse {
  return {};
}
export const MsgEditValidatorResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgEditValidatorResponse',
  encode(_: MsgEditValidatorResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgEditValidatorResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgEditValidatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgEditValidatorResponse>): MsgEditValidatorResponse {
    const message = createBaseMsgEditValidatorResponse();
    return message;
  },
  fromAmino(_: MsgEditValidatorResponseAmino): MsgEditValidatorResponse {
    const message = createBaseMsgEditValidatorResponse();
    return message;
  },
  toAmino(_: MsgEditValidatorResponse): MsgEditValidatorResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgEditValidatorResponseAminoMsg): MsgEditValidatorResponse {
    return MsgEditValidatorResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgEditValidatorResponse): MsgEditValidatorResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgEditValidatorResponse',
      value: MsgEditValidatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgEditValidatorResponseProtoMsg): MsgEditValidatorResponse {
    return MsgEditValidatorResponse.decode(message.value);
  },
  toProto(message: MsgEditValidatorResponse): Uint8Array {
    return MsgEditValidatorResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgEditValidatorResponse): MsgEditValidatorResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgEditValidatorResponse',
      value: MsgEditValidatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgDelegate(): MsgDelegate {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgDelegate = {
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
  encode(message: MsgDelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgDelegate>): MsgDelegate {
    const message = createBaseMsgDelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    
    
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgDelegateAmino): MsgDelegate {
    const message = createBaseMsgDelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgDelegate): MsgDelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgDelegateAminoMsg): MsgDelegate {
    return MsgDelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDelegate): MsgDelegateAminoMsg {
    return {
      type: 'cosmos-sdk/MsgDelegate',
      value: MsgDelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDelegateProtoMsg): MsgDelegate {
    return MsgDelegate.decode(message.value);
  },
  toProto(message: MsgDelegate): Uint8Array {
    return MsgDelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegate): MsgDelegateProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
      value: MsgDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgDelegateResponse(): MsgDelegateResponse {
  return {};
}
export const MsgDelegateResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgDelegateResponse',
  encode(_: MsgDelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgDelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgDelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgDelegateResponse>): MsgDelegateResponse {
    const message = createBaseMsgDelegateResponse();
    return message;
  },
  fromAmino(_: MsgDelegateResponseAmino): MsgDelegateResponse {
    const message = createBaseMsgDelegateResponse();
    return message;
  },
  toAmino(_: MsgDelegateResponse): MsgDelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgDelegateResponseAminoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgDelegateResponse): MsgDelegateResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgDelegateResponse',
      value: MsgDelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgDelegateResponseProtoMsg): MsgDelegateResponse {
    return MsgDelegateResponse.decode(message.value);
  },
  toProto(message: MsgDelegateResponse): Uint8Array {
    return MsgDelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgDelegateResponse): MsgDelegateResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgDelegateResponse',
      value: MsgDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginRedelegate(): MsgBeginRedelegate {
  return {
    delegatorAddress: '',
    validatorSrcAddress: '',
    validatorDstAddress: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgBeginRedelegate = {
  typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  encode(message: MsgBeginRedelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorSrcAddress !== '') {
      writer.uint32(18).string(message.validatorSrcAddress);
    }
    if (message.validatorDstAddress !== '') {
      writer.uint32(26).string(message.validatorDstAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBeginRedelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginRedelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorSrcAddress = reader.string();
          break;
        case 3:
          message.validatorDstAddress = reader.string();
          break;
        case 4:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBeginRedelegate>): MsgBeginRedelegate {
    const message = createBaseMsgBeginRedelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorSrcAddress = object.validatorSrcAddress ?? '';
    message.validatorDstAddress = object.validatorDstAddress ?? '';
    
    
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgBeginRedelegateAmino): MsgBeginRedelegate {
    const message = createBaseMsgBeginRedelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_src_address !== undefined && object.validator_src_address !== null) {
      message.validatorSrcAddress = object.validator_src_address;
    }
    if (object.validator_dst_address !== undefined && object.validator_dst_address !== null) {
      message.validatorDstAddress = object.validator_dst_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgBeginRedelegate): MsgBeginRedelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_src_address = message.validatorSrcAddress === '' ? undefined : message.validatorSrcAddress;
    obj.validator_dst_address = message.validatorDstAddress === '' ? undefined : message.validatorDstAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgBeginRedelegateAminoMsg): MsgBeginRedelegate {
    return MsgBeginRedelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBeginRedelegate): MsgBeginRedelegateAminoMsg {
    return {
      type: 'cosmos-sdk/MsgBeginRedelegate',
      value: MsgBeginRedelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBeginRedelegateProtoMsg): MsgBeginRedelegate {
    return MsgBeginRedelegate.decode(message.value);
  },
  toProto(message: MsgBeginRedelegate): Uint8Array {
    return MsgBeginRedelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgBeginRedelegate): MsgBeginRedelegateProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
      value: MsgBeginRedelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgBeginRedelegateResponse(): MsgBeginRedelegateResponse {
  return {
    completionTime: new Date(),
  };
}
export const MsgBeginRedelegateResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegateResponse',
  encode(message: MsgBeginRedelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.completionTime !== undefined) {
      Timestamp.encode(toTimestamp(message.completionTime), writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgBeginRedelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBeginRedelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.completionTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBeginRedelegateResponse>): MsgBeginRedelegateResponse {
    const message = createBaseMsgBeginRedelegateResponse();
    
    
    message.completionTime = object.completionTime ?? undefined;
    return message;
  },
  fromAmino(object: MsgBeginRedelegateResponseAmino): MsgBeginRedelegateResponse {
    const message = createBaseMsgBeginRedelegateResponse();
    if (object.completion_time !== undefined && object.completion_time !== null) {
      message.completionTime = fromTimestamp(Timestamp.fromAmino(object.completion_time));
    }
    return message;
  },
  toAmino(message: MsgBeginRedelegateResponse): MsgBeginRedelegateResponseAmino {
    const obj: any = {};
    obj.completion_time = message.completionTime ? Timestamp.toAmino(toTimestamp(message.completionTime)) : new Date();
    return obj;
  },
  fromAminoMsg(object: MsgBeginRedelegateResponseAminoMsg): MsgBeginRedelegateResponse {
    return MsgBeginRedelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBeginRedelegateResponse): MsgBeginRedelegateResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgBeginRedelegateResponse',
      value: MsgBeginRedelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBeginRedelegateResponseProtoMsg): MsgBeginRedelegateResponse {
    return MsgBeginRedelegateResponse.decode(message.value);
  },
  toProto(message: MsgBeginRedelegateResponse): Uint8Array {
    return MsgBeginRedelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBeginRedelegateResponse): MsgBeginRedelegateResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegateResponse',
      value: MsgBeginRedelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUndelegate(): MsgUndelegate {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: Coin.fromPartial({}),
  };
}
export const MsgUndelegate = {
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
  encode(message: MsgUndelegate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUndelegate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUndelegate>): MsgUndelegate {
    const message = createBaseMsgUndelegate();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    
    
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgUndelegateAmino): MsgUndelegate {
    const message = createBaseMsgUndelegate();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgUndelegate): MsgUndelegateAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgUndelegateAminoMsg): MsgUndelegate {
    return MsgUndelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUndelegate): MsgUndelegateAminoMsg {
    return {
      type: 'cosmos-sdk/MsgUndelegate',
      value: MsgUndelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUndelegateProtoMsg): MsgUndelegate {
    return MsgUndelegate.decode(message.value);
  },
  toProto(message: MsgUndelegate): Uint8Array {
    return MsgUndelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgUndelegate): MsgUndelegateProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegate',
      value: MsgUndelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgUndelegateResponse(): MsgUndelegateResponse {
  return {
    completionTime: new Date(),
    amount: Coin.fromPartial({}),
  };
}
export const MsgUndelegateResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgUndelegateResponse',
  encode(message: MsgUndelegateResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.completionTime !== undefined) {
      Timestamp.encode(toTimestamp(message.completionTime), writer.uint32(10).fork()).ldelim();
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUndelegateResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUndelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.completionTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;
        case 2:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUndelegateResponse>): MsgUndelegateResponse {
    const message = createBaseMsgUndelegateResponse();
    
    
    message.completionTime = object.completionTime ?? undefined;
    
    
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    return message;
  },
  fromAmino(object: MsgUndelegateResponseAmino): MsgUndelegateResponse {
    const message = createBaseMsgUndelegateResponse();
    if (object.completion_time !== undefined && object.completion_time !== null) {
      message.completionTime = fromTimestamp(Timestamp.fromAmino(object.completion_time));
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    return message;
  },
  toAmino(message: MsgUndelegateResponse): MsgUndelegateResponseAmino {
    const obj: any = {};
    obj.completion_time = message.completionTime ? Timestamp.toAmino(toTimestamp(message.completionTime)) : new Date();
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgUndelegateResponseAminoMsg): MsgUndelegateResponse {
    return MsgUndelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUndelegateResponse): MsgUndelegateResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgUndelegateResponse',
      value: MsgUndelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUndelegateResponseProtoMsg): MsgUndelegateResponse {
    return MsgUndelegateResponse.decode(message.value);
  },
  toProto(message: MsgUndelegateResponse): Uint8Array {
    return MsgUndelegateResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUndelegateResponse): MsgUndelegateResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgUndelegateResponse',
      value: MsgUndelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelUnbondingDelegation(): MsgCancelUnbondingDelegation {
  return {
    delegatorAddress: '',
    validatorAddress: '',
    amount: Coin.fromPartial({}),
    creationHeight: BigInt(0),
  };
}
export const MsgCancelUnbondingDelegation = {
  typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
  encode(message: MsgCancelUnbondingDelegation, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.delegatorAddress !== '') {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== '') {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
    }
    if (message.creationHeight !== BigInt(0)) {
      writer.uint32(32).int64(message.creationHeight);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelUnbondingDelegation {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelUnbondingDelegation();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.creationHeight = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCancelUnbondingDelegation>): MsgCancelUnbondingDelegation {
    const message = createBaseMsgCancelUnbondingDelegation();
    message.delegatorAddress = object.delegatorAddress ?? '';
    message.validatorAddress = object.validatorAddress ?? '';
    
    
    message.amount =
      object.amount !== undefined && object.amount !== null ? Coin.fromPartial(object.amount) : undefined;
    message.creationHeight =
      object.creationHeight !== undefined && object.creationHeight !== null
        ? BigInt(object.creationHeight.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgCancelUnbondingDelegationAmino): MsgCancelUnbondingDelegation {
    const message = createBaseMsgCancelUnbondingDelegation();
    if (object.delegator_address !== undefined && object.delegator_address !== null) {
      message.delegatorAddress = object.delegator_address;
    }
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.amount !== undefined && object.amount !== null) {
      message.amount = Coin.fromAmino(object.amount);
    }
    if (object.creation_height !== undefined && object.creation_height !== null) {
      message.creationHeight = BigInt(object.creation_height);
    }
    return message;
  },
  toAmino(message: MsgCancelUnbondingDelegation): MsgCancelUnbondingDelegationAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress === '' ? undefined : message.delegatorAddress;
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : Coin.toAmino(Coin.fromPartial({}));
    obj.creation_height = message.creationHeight !== BigInt(0) ? message.creationHeight?.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCancelUnbondingDelegationAminoMsg): MsgCancelUnbondingDelegation {
    return MsgCancelUnbondingDelegation.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelUnbondingDelegation): MsgCancelUnbondingDelegationAminoMsg {
    return {
      type: 'cosmos-sdk/MsgCancelUnbondingDelegation',
      value: MsgCancelUnbondingDelegation.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelUnbondingDelegationProtoMsg): MsgCancelUnbondingDelegation {
    return MsgCancelUnbondingDelegation.decode(message.value);
  },
  toProto(message: MsgCancelUnbondingDelegation): Uint8Array {
    return MsgCancelUnbondingDelegation.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelUnbondingDelegation): MsgCancelUnbondingDelegationProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation',
      value: MsgCancelUnbondingDelegation.encode(message).finish(),
    };
  },
};
function createBaseMsgCancelUnbondingDelegationResponse(): MsgCancelUnbondingDelegationResponse {
  return {};
}
export const MsgCancelUnbondingDelegationResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegationResponse',
  encode(_: MsgCancelUnbondingDelegationResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCancelUnbondingDelegationResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelUnbondingDelegationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgCancelUnbondingDelegationResponse>): MsgCancelUnbondingDelegationResponse {
    const message = createBaseMsgCancelUnbondingDelegationResponse();
    return message;
  },
  fromAmino(_: MsgCancelUnbondingDelegationResponseAmino): MsgCancelUnbondingDelegationResponse {
    const message = createBaseMsgCancelUnbondingDelegationResponse();
    return message;
  },
  toAmino(_: MsgCancelUnbondingDelegationResponse): MsgCancelUnbondingDelegationResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCancelUnbondingDelegationResponseAminoMsg): MsgCancelUnbondingDelegationResponse {
    return MsgCancelUnbondingDelegationResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCancelUnbondingDelegationResponse): MsgCancelUnbondingDelegationResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgCancelUnbondingDelegationResponse',
      value: MsgCancelUnbondingDelegationResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCancelUnbondingDelegationResponseProtoMsg): MsgCancelUnbondingDelegationResponse {
    return MsgCancelUnbondingDelegationResponse.decode(message.value);
  },
  toProto(message: MsgCancelUnbondingDelegationResponse): Uint8Array {
    return MsgCancelUnbondingDelegationResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCancelUnbondingDelegationResponse): MsgCancelUnbondingDelegationResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgCancelUnbondingDelegationResponse',
      value: MsgCancelUnbondingDelegationResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParams(): MsgUpdateParams {
  return {
    authority: '',
    params: Params.fromPartial({}),
  };
}
export const MsgUpdateParams = {
  typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParams',
  encode(message: MsgUpdateParams, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.authority !== '') {
      writer.uint32(10).string(message.authority);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParams {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgUpdateParams>): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    message.authority = object.authority ?? '';
    
    
    message.params =
      object.params !== undefined && object.params !== null ? Params.fromPartial(object.params) : undefined;
    return message;
  },
  fromAmino(object: MsgUpdateParamsAmino): MsgUpdateParams {
    const message = createBaseMsgUpdateParams();
    if (object.authority !== undefined && object.authority !== null) {
      message.authority = object.authority;
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    return message;
  },
  toAmino(message: MsgUpdateParams): MsgUpdateParamsAmino {
    const obj: any = {};
    obj.authority = message.authority === '' ? undefined : message.authority;
    obj.params = message.params ? Params.toAmino(message.params) : Params.toAmino(Params.fromPartial({}));
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsAminoMsg): MsgUpdateParams {
    return MsgUpdateParams.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateParams): MsgUpdateParamsAminoMsg {
    return {
      type: 'cosmos-sdk/x/staking/MsgUpdateParams',
      value: MsgUpdateParams.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateParamsProtoMsg): MsgUpdateParams {
    return MsgUpdateParams.decode(message.value);
  },
  toProto(message: MsgUpdateParams): Uint8Array {
    return MsgUpdateParams.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParams): MsgUpdateParamsProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParams',
      value: MsgUpdateParams.encode(message).finish(),
    };
  },
};
function createBaseMsgUpdateParamsResponse(): MsgUpdateParamsResponse {
  return {};
}
export const MsgUpdateParamsResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParamsResponse',
  encode(_: MsgUpdateParamsResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgUpdateParamsResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUpdateParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgUpdateParamsResponse>): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  fromAmino(_: MsgUpdateParamsResponseAmino): MsgUpdateParamsResponse {
    const message = createBaseMsgUpdateParamsResponse();
    return message;
  },
  toAmino(_: MsgUpdateParamsResponse): MsgUpdateParamsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgUpdateParamsResponseAminoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgUpdateParamsResponseProtoMsg): MsgUpdateParamsResponse {
    return MsgUpdateParamsResponse.decode(message.value);
  },
  toProto(message: MsgUpdateParamsResponse): Uint8Array {
    return MsgUpdateParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgUpdateParamsResponse): MsgUpdateParamsResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgUpdateParamsResponse',
      value: MsgUpdateParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRotateConsPubKey(): MsgRotateConsPubKey {
  return {
    validatorAddress: '',
    newPubkey: undefined,
  };
}
export const MsgRotateConsPubKey = {
  typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKey',
  encode(message: MsgRotateConsPubKey, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.validatorAddress !== '') {
      writer.uint32(10).string(message.validatorAddress);
    }
    if (message.newPubkey !== undefined) {
      Any.encode(message.newPubkey, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRotateConsPubKey {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRotateConsPubKey();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddress = reader.string();
          break;
        case 2:
          message.newPubkey = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRotateConsPubKey>): MsgRotateConsPubKey {
    const message = createBaseMsgRotateConsPubKey();
    message.validatorAddress = object.validatorAddress ?? '';
    message.newPubkey =
      object.newPubkey !== undefined && object.newPubkey !== null ? Any.fromPartial(object.newPubkey) : undefined;
    return message;
  },
  fromAmino(object: MsgRotateConsPubKeyAmino): MsgRotateConsPubKey {
    const message = createBaseMsgRotateConsPubKey();
    if (object.validator_address !== undefined && object.validator_address !== null) {
      message.validatorAddress = object.validator_address;
    }
    if (object.new_pubkey !== undefined && object.new_pubkey !== null) {
      message.newPubkey = encodePubkey(object.new_pubkey);
    }
    return message;
  },
  toAmino(message: MsgRotateConsPubKey): MsgRotateConsPubKeyAmino {
    const obj: any = {};
    obj.validator_address = message.validatorAddress === '' ? undefined : message.validatorAddress;
    obj.new_pubkey = message.newPubkey ? decodePubkey(message.newPubkey) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRotateConsPubKeyAminoMsg): MsgRotateConsPubKey {
    return MsgRotateConsPubKey.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRotateConsPubKey): MsgRotateConsPubKeyAminoMsg {
    return {
      type: 'cosmos-sdk/MsgRotateConsPubKey',
      value: MsgRotateConsPubKey.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRotateConsPubKeyProtoMsg): MsgRotateConsPubKey {
    return MsgRotateConsPubKey.decode(message.value);
  },
  toProto(message: MsgRotateConsPubKey): Uint8Array {
    return MsgRotateConsPubKey.encode(message).finish();
  },
  toProtoMsg(message: MsgRotateConsPubKey): MsgRotateConsPubKeyProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKey',
      value: MsgRotateConsPubKey.encode(message).finish(),
    };
  },
};
function createBaseMsgRotateConsPubKeyResponse(): MsgRotateConsPubKeyResponse {
  return {};
}
export const MsgRotateConsPubKeyResponse = {
  typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKeyResponse',
  encode(_: MsgRotateConsPubKeyResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgRotateConsPubKeyResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRotateConsPubKeyResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgRotateConsPubKeyResponse>): MsgRotateConsPubKeyResponse {
    const message = createBaseMsgRotateConsPubKeyResponse();
    return message;
  },
  fromAmino(_: MsgRotateConsPubKeyResponseAmino): MsgRotateConsPubKeyResponse {
    const message = createBaseMsgRotateConsPubKeyResponse();
    return message;
  },
  toAmino(_: MsgRotateConsPubKeyResponse): MsgRotateConsPubKeyResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgRotateConsPubKeyResponseAminoMsg): MsgRotateConsPubKeyResponse {
    return MsgRotateConsPubKeyResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRotateConsPubKeyResponse): MsgRotateConsPubKeyResponseAminoMsg {
    return {
      type: 'cosmos-sdk/MsgRotateConsPubKeyResponse',
      value: MsgRotateConsPubKeyResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgRotateConsPubKeyResponseProtoMsg): MsgRotateConsPubKeyResponse {
    return MsgRotateConsPubKeyResponse.decode(message.value);
  },
  toProto(message: MsgRotateConsPubKeyResponse): Uint8Array {
    return MsgRotateConsPubKeyResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgRotateConsPubKeyResponse): MsgRotateConsPubKeyResponseProtoMsg {
    return {
      typeUrl: '/cosmos.staking.v1beta1.MsgRotateConsPubKeyResponse',
      value: MsgRotateConsPubKeyResponse.encode(message).finish(),
    };
  },
};
