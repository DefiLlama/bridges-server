/**
 * NOTE: THIS IS AN AUTO-GENERATED FILE. DO NOT MODIFY IT DIRECTLY.
 */
/* eslint-disable */

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  bigint: any;
  jsonb: any;
  numeric: any;
  timestamp: any;
};

/** expression to compare columns of type Boolean. All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']>;
  _gt?: InputMaybe<Scalars['Boolean']>;
  _gte?: InputMaybe<Scalars['Boolean']>;
  _in?: InputMaybe<Array<Scalars['Boolean']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Boolean']>;
  _lte?: InputMaybe<Scalars['Boolean']>;
  _neq?: InputMaybe<Scalars['Boolean']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']>>;
};

/** expression to compare columns of type Float. All fields are combined with logical 'AND'. */
export type Float_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Float']>;
  _gt?: InputMaybe<Scalars['Float']>;
  _gte?: InputMaybe<Scalars['Float']>;
  _in?: InputMaybe<Array<Scalars['Float']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Float']>;
  _lte?: InputMaybe<Scalars['Float']>;
  _neq?: InputMaybe<Scalars['Float']>;
  _nin?: InputMaybe<Array<Scalars['Float']>>;
};

/** expression to compare columns of type Int. All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']>;
  _gt?: InputMaybe<Scalars['Int']>;
  _gte?: InputMaybe<Scalars['Int']>;
  _in?: InputMaybe<Array<Scalars['Int']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['Int']>;
  _lte?: InputMaybe<Scalars['Int']>;
  _neq?: InputMaybe<Scalars['Int']>;
  _nin?: InputMaybe<Array<Scalars['Int']>>;
};

/** expression to compare columns of type String. All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  _nlike?: InputMaybe<Scalars['String']>;
  _nsimilar?: InputMaybe<Scalars['String']>;
  _similar?: InputMaybe<Scalars['String']>;
};

/** expression to compare columns of type bigint. All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']>;
  _gt?: InputMaybe<Scalars['bigint']>;
  _gte?: InputMaybe<Scalars['bigint']>;
  _in?: InputMaybe<Array<Scalars['bigint']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['bigint']>;
  _lte?: InputMaybe<Scalars['bigint']>;
  _neq?: InputMaybe<Scalars['bigint']>;
  _nin?: InputMaybe<Array<Scalars['bigint']>>;
};

/** columns and relationships of "blocks_log" */
export type Blocks_Log = {
  last_processed_block: Scalars['Int'];
  last_updated_at: Scalars['timestamp'];
  zone: Scalars['String'];
};

/** Boolean expression to filter rows from the table "blocks_log". All fields are combined with a logical 'AND'. */
export type Blocks_Log_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Blocks_Log_Bool_Exp>>>;
  _not?: InputMaybe<Blocks_Log_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Blocks_Log_Bool_Exp>>>;
  last_processed_block?: InputMaybe<Int_Comparison_Exp>;
  last_updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
};

/** ordering options when selecting data from "blocks_log" */
export type Blocks_Log_Order_By = {
  last_processed_block?: InputMaybe<Order_By>;
  last_updated_at?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "blocks_log" */
export type Blocks_Log_Pk_Columns_Input = {
  zone: Scalars['String'];
};

/** select columns of table "blocks_log" */
export const enum Blocks_Log_Select_Column {
  /** column name */
  LastProcessedBlock = 'last_processed_block',
  /** column name */
  LastUpdatedAt = 'last_updated_at',
  /** column name */
  Zone = 'zone',
}

/** columns and relationships of "channels_stats" */
export type Channels_Stats = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  ibc_tx_1d: Scalars['Int'];
  ibc_tx_1d_diff: Scalars['Int'];
  ibc_tx_1d_failed: Scalars['Int'];
  ibc_tx_1d_failed_diff: Scalars['Int'];
  ibc_tx_7d: Scalars['Int'];
  ibc_tx_7d_diff: Scalars['Int'];
  ibc_tx_7d_failed: Scalars['Int'];
  ibc_tx_7d_failed_diff: Scalars['Int'];
  ibc_tx_30d: Scalars['Int'];
  ibc_tx_30d_diff: Scalars['Int'];
  ibc_tx_30d_failed: Scalars['Int'];
  ibc_tx_30d_failed_diff: Scalars['Int'];
  is_opened: Scalars['Boolean'];
  is_zone_counerparty_mainnet: Scalars['Boolean'];
  zone: Scalars['String'];
  zone_counerparty: Scalars['String'];
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name: Scalars['String'];
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name: Scalars['String'];
};

/** aggregated selection of "channels_stats" */
export type Channels_Stats_Aggregate = {
  aggregate?: Maybe<Channels_Stats_Aggregate_Fields>;
  nodes: Array<Channels_Stats>;
};

/** aggregate fields of "channels_stats" */
export type Channels_Stats_Aggregate_Fields = {
  avg?: Maybe<Channels_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Channels_Stats_Max_Fields>;
  min?: Maybe<Channels_Stats_Min_Fields>;
  stddev?: Maybe<Channels_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Channels_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Channels_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Channels_Stats_Sum_Fields>;
  var_pop?: Maybe<Channels_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Channels_Stats_Var_Samp_Fields>;
  variance?: Maybe<Channels_Stats_Variance_Fields>;
};

/** aggregate fields of "channels_stats" */
export type Channels_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Channels_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "channels_stats" */
export type Channels_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Channels_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Channels_Stats_Max_Order_By>;
  min?: InputMaybe<Channels_Stats_Min_Order_By>;
  stddev?: InputMaybe<Channels_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Channels_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Channels_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Channels_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Channels_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Channels_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Channels_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Channels_Stats_Avg_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "channels_stats" */
export type Channels_Stats_Avg_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "channels_stats". All fields are combined with a logical 'AND'. */
export type Channels_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Channels_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Channels_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Channels_Stats_Bool_Exp>>>;
  channel_id?: InputMaybe<String_Comparison_Exp>;
  client_id?: InputMaybe<String_Comparison_Exp>;
  connection_id?: InputMaybe<String_Comparison_Exp>;
  ibc_tx_1d?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_1d_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_1d_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_1d_failed_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_7d?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_7d_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_7d_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_7d_failed_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_30d?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_30d_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_30d_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_30d_failed_diff?: InputMaybe<Int_Comparison_Exp>;
  is_opened?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_counerparty_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
  zone_counerparty?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_channel_id?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_label_url2?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_readable_name?: InputMaybe<String_Comparison_Exp>;
  zone_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_label_url2?: InputMaybe<String_Comparison_Exp>;
  zone_readable_name?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Channels_Stats_Max_Fields = {
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  ibc_tx_1d?: Maybe<Scalars['Int']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d?: Maybe<Scalars['Int']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d?: Maybe<Scalars['Int']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counerparty?: Maybe<Scalars['String']>;
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "channels_stats" */
export type Channels_Stats_Max_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counerparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Channels_Stats_Min_Fields = {
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  ibc_tx_1d?: Maybe<Scalars['Int']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d?: Maybe<Scalars['Int']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d?: Maybe<Scalars['Int']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counerparty?: Maybe<Scalars['String']>;
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "channels_stats" */
export type Channels_Stats_Min_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counerparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "channels_stats" */
export type Channels_Stats_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
  is_opened?: InputMaybe<Order_By>;
  is_zone_counerparty_mainnet?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counerparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "channels_stats" */
export type Channels_Stats_Pk_Columns_Input = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  zone: Scalars['String'];
};

/** select columns of table "channels_stats" */
export const enum Channels_Stats_Select_Column {
  /** column name */
  ChannelId = 'channel_id',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  ConnectionId = 'connection_id',
  /** column name */
  IbcTx_1d = 'ibc_tx_1d',
  /** column name */
  IbcTx_1dDiff = 'ibc_tx_1d_diff',
  /** column name */
  IbcTx_1dFailed = 'ibc_tx_1d_failed',
  /** column name */
  IbcTx_1dFailedDiff = 'ibc_tx_1d_failed_diff',
  /** column name */
  IbcTx_7d = 'ibc_tx_7d',
  /** column name */
  IbcTx_7dDiff = 'ibc_tx_7d_diff',
  /** column name */
  IbcTx_7dFailed = 'ibc_tx_7d_failed',
  /** column name */
  IbcTx_7dFailedDiff = 'ibc_tx_7d_failed_diff',
  /** column name */
  IbcTx_30d = 'ibc_tx_30d',
  /** column name */
  IbcTx_30dDiff = 'ibc_tx_30d_diff',
  /** column name */
  IbcTx_30dFailed = 'ibc_tx_30d_failed',
  /** column name */
  IbcTx_30dFailedDiff = 'ibc_tx_30d_failed_diff',
  /** column name */
  IsOpened = 'is_opened',
  /** column name */
  IsZoneCounerpartyMainnet = 'is_zone_counerparty_mainnet',
  /** column name */
  Zone = 'zone',
  /** column name */
  ZoneCounerparty = 'zone_counerparty',
  /** column name */
  ZoneCounterpartyChannelId = 'zone_counterparty_channel_id',
  /** column name */
  ZoneCounterpartyLabelUrl = 'zone_counterparty_label_url',
  /** column name */
  ZoneCounterpartyLabelUrl2 = 'zone_counterparty_label_url2',
  /** column name */
  ZoneCounterpartyReadableName = 'zone_counterparty_readable_name',
  /** column name */
  ZoneLabelUrl = 'zone_label_url',
  /** column name */
  ZoneLabelUrl2 = 'zone_label_url2',
  /** column name */
  ZoneReadableName = 'zone_readable_name',
}

/** aggregate stddev on columns */
export type Channels_Stats_Stddev_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "channels_stats" */
export type Channels_Stats_Stddev_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Channels_Stats_Stddev_Pop_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "channels_stats" */
export type Channels_Stats_Stddev_Pop_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Channels_Stats_Stddev_Samp_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "channels_stats" */
export type Channels_Stats_Stddev_Samp_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Channels_Stats_Sum_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Int']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d?: Maybe<Scalars['Int']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d?: Maybe<Scalars['Int']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Int']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "channels_stats" */
export type Channels_Stats_Sum_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Channels_Stats_Var_Pop_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "channels_stats" */
export type Channels_Stats_Var_Pop_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Channels_Stats_Var_Samp_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "channels_stats" */
export type Channels_Stats_Var_Samp_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Channels_Stats_Variance_Fields = {
  ibc_tx_1d?: Maybe<Scalars['Float']>;
  ibc_tx_1d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_1d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d?: Maybe<Scalars['Float']>;
  ibc_tx_7d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_7d_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d?: Maybe<Scalars['Float']>;
  ibc_tx_30d_diff?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed?: Maybe<Scalars['Float']>;
  ibc_tx_30d_failed_diff?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "channels_stats" */
export type Channels_Stats_Variance_Order_By = {
  ibc_tx_1d?: InputMaybe<Order_By>;
  ibc_tx_1d_diff?: InputMaybe<Order_By>;
  ibc_tx_1d_failed?: InputMaybe<Order_By>;
  ibc_tx_1d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_7d?: InputMaybe<Order_By>;
  ibc_tx_7d_diff?: InputMaybe<Order_By>;
  ibc_tx_7d_failed?: InputMaybe<Order_By>;
  ibc_tx_7d_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_30d?: InputMaybe<Order_By>;
  ibc_tx_30d_diff?: InputMaybe<Order_By>;
  ibc_tx_30d_failed?: InputMaybe<Order_By>;
  ibc_tx_30d_failed_diff?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchain_relations" */
export type Flat_Blockchain_Relations = {
  /** An object relationship */
  blockchain: Flat_Blockchains;
  /** An object relationship */
  blockchainByBlockchainSource: Flat_Blockchains;
  blockchain_source: Scalars['String'];
  blockchain_target: Scalars['String'];
  ibc_cashflow: Scalars['bigint'];
  ibc_cashflow_diff: Scalars['bigint'];
  ibc_cashflow_pending: Scalars['bigint'];
  ibc_transfers: Scalars['Int'];
  ibc_transfers_diff: Scalars['Int'];
  ibc_transfers_failed: Scalars['Int'];
  ibc_transfers_pending: Scalars['Int'];
  is_mainnet: Scalars['Boolean'];
  source_to_target_ibc_cashflow: Scalars['bigint'];
  source_to_target_ibc_transfers: Scalars['Int'];
  target_to_source_ibc_cashflow: Scalars['bigint'];
  target_to_source_ibc_transfers: Scalars['Int'];
  timeframe: Scalars['Int'];
  /** An object relationship */
  timeframeByTimeframe: Flat_Timeframes;
};

/** aggregated selection of "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Relations_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Relations>;
};

/** aggregate fields of "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchain_Relations_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Relations_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Relations_Min_Fields>;
  stddev?: Maybe<Flat_Blockchain_Relations_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchain_Relations_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchain_Relations_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchain_Relations_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchain_Relations_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchain_Relations_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchain_Relations_Variance_Fields>;
};

/** aggregate fields of "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchain_Relations_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Relations_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Relations_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchain_Relations_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchain_Relations_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchain_Relations_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchain_Relations_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchain_Relations_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchain_Relations_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchain_Relations_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchain_Relations_Avg_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Avg_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_relations". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Relations_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Relations_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Relations_Bool_Exp>>>;
  blockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchainByBlockchainSource?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchain_source?: InputMaybe<String_Comparison_Exp>;
  blockchain_target?: InputMaybe<String_Comparison_Exp>;
  ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending?: InputMaybe<Int_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  source_to_target_ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  source_to_target_ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  target_to_source_ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  target_to_source_ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Relations_Max_Fields = {
  blockchain_source?: Maybe<Scalars['String']>;
  blockchain_target?: Maybe<Scalars['String']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['bigint']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Int']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['bigint']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Max_Order_By = {
  blockchain_source?: InputMaybe<Order_By>;
  blockchain_target?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Relations_Min_Fields = {
  blockchain_source?: Maybe<Scalars['String']>;
  blockchain_target?: Maybe<Scalars['String']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['bigint']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Int']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['bigint']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Min_Order_By = {
  blockchain_source?: InputMaybe<Order_By>;
  blockchain_target?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Order_By = {
  blockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchainByBlockchainSource?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchain_source?: InputMaybe<Order_By>;
  blockchain_target?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Order_By>;
};

/** primary key columns input for table: "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Pk_Columns_Input = {
  blockchain_source: Scalars['String'];
  blockchain_target: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.blockchain_relations" */
export const enum Flat_Blockchain_Relations_Select_Column {
  /** column name */
  BlockchainSource = 'blockchain_source',
  /** column name */
  BlockchainTarget = 'blockchain_target',
  /** column name */
  IbcCashflow = 'ibc_cashflow',
  /** column name */
  IbcCashflowDiff = 'ibc_cashflow_diff',
  /** column name */
  IbcCashflowPending = 'ibc_cashflow_pending',
  /** column name */
  IbcTransfers = 'ibc_transfers',
  /** column name */
  IbcTransfersDiff = 'ibc_transfers_diff',
  /** column name */
  IbcTransfersFailed = 'ibc_transfers_failed',
  /** column name */
  IbcTransfersPending = 'ibc_transfers_pending',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  SourceToTargetIbcCashflow = 'source_to_target_ibc_cashflow',
  /** column name */
  SourceToTargetIbcTransfers = 'source_to_target_ibc_transfers',
  /** column name */
  TargetToSourceIbcCashflow = 'target_to_source_ibc_cashflow',
  /** column name */
  TargetToSourceIbcTransfers = 'target_to_source_ibc_transfers',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Flat_Blockchain_Relations_Stddev_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Stddev_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchain_Relations_Stddev_Pop_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Stddev_Pop_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchain_Relations_Stddev_Samp_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Stddev_Samp_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchain_Relations_Sum_Fields = {
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['bigint']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Int']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['bigint']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Sum_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchain_Relations_Var_Pop_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Var_Pop_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchain_Relations_Var_Samp_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Var_Samp_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchain_Relations_Variance_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_to_target_ibc_cashflow?: Maybe<Scalars['Float']>;
  source_to_target_ibc_transfers?: Maybe<Scalars['Float']>;
  target_to_source_ibc_cashflow?: Maybe<Scalars['Float']>;
  target_to_source_ibc_transfers?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchain_relations" */
export type Flat_Blockchain_Relations_Variance_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_to_target_ibc_cashflow?: InputMaybe<Order_By>;
  source_to_target_ibc_transfers?: InputMaybe<Order_By>;
  target_to_source_ibc_cashflow?: InputMaybe<Order_By>;
  target_to_source_ibc_transfers?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchain_stats" */
export type Flat_Blockchain_Stats = {
  active_addresses_cnt?: Maybe<Scalars['Int']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchainByBlockchain: Flat_Blockchains;
  /** An array relationship */
  blockchain_tf_charts: Array<Flat_Blockchain_Tf_Charts>;
  /** An aggregated array relationship */
  blockchain_tf_charts_aggregate: Flat_Blockchain_Tf_Charts_Aggregate;
  current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_percent?: Maybe<Scalars['numeric']>;
  ibc_current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Int']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Int']>;
  previous_active_addresses?: Maybe<Scalars['Int']>;
  repeatable_addresses?: Maybe<Scalars['Int']>;
  timeframe: Scalars['Int'];
  /** An object relationship */
  timeframeByTimeframe: Flat_Timeframes;
  txs: Scalars['Int'];
  txs_diff: Scalars['Int'];
};

/** columns and relationships of "flat.blockchain_stats" */
export type Flat_Blockchain_StatsBlockchain_Tf_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.blockchain_stats" */
export type Flat_Blockchain_StatsBlockchain_Tf_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Stats_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Stats>;
};

/** aggregate fields of "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchain_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Stats_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Stats_Min_Fields>;
  stddev?: Maybe<Flat_Blockchain_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchain_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchain_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchain_Stats_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchain_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchain_Stats_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchain_Stats_Variance_Fields>;
};

/** aggregate fields of "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchain_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Stats_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Stats_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchain_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchain_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchain_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchain_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchain_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchain_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchain_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchain_Stats_Avg_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Avg_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_stats". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Stats_Bool_Exp>>>;
  active_addresses_cnt?: InputMaybe<Int_Comparison_Exp>;
  active_addresses_cnt_diff?: InputMaybe<Int_Comparison_Exp>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchain_tf_charts?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
  current_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_cnt?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_current_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  ibc_previous_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  ibc_repeatable_addresses?: InputMaybe<Int_Comparison_Exp>;
  previous_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  repeatable_addresses?: InputMaybe<Int_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Bool_Exp>;
  txs?: InputMaybe<Int_Comparison_Exp>;
  txs_diff?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Stats_Max_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Int']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  blockchain?: Maybe<Scalars['String']>;
  current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_percent?: Maybe<Scalars['numeric']>;
  ibc_current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Int']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Int']>;
  previous_active_addresses?: Maybe<Scalars['Int']>;
  repeatable_addresses?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs?: Maybe<Scalars['Int']>;
  txs_diff?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Max_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Stats_Min_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Int']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  blockchain?: Maybe<Scalars['String']>;
  current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_percent?: Maybe<Scalars['numeric']>;
  ibc_current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Int']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Int']>;
  previous_active_addresses?: Maybe<Scalars['Int']>;
  repeatable_addresses?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs?: Maybe<Scalars['Int']>;
  txs_diff?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Min_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchain_tf_charts_aggregate?: InputMaybe<Flat_Blockchain_Tf_Charts_Aggregate_Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.blockchain_stats" */
export const enum Flat_Blockchain_Stats_Select_Column {
  /** column name */
  ActiveAddressesCnt = 'active_addresses_cnt',
  /** column name */
  ActiveAddressesCntDiff = 'active_addresses_cnt_diff',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  CurrentActiveAddresses = 'current_active_addresses',
  /** column name */
  IbcActiveAddressesCnt = 'ibc_active_addresses_cnt',
  /** column name */
  IbcActiveAddressesCntDiff = 'ibc_active_addresses_cnt_diff',
  /** column name */
  IbcActiveAddressesPercent = 'ibc_active_addresses_percent',
  /** column name */
  IbcCurrentActiveAddresses = 'ibc_current_active_addresses',
  /** column name */
  IbcPreviousActiveAddresses = 'ibc_previous_active_addresses',
  /** column name */
  IbcRepeatableAddresses = 'ibc_repeatable_addresses',
  /** column name */
  PreviousActiveAddresses = 'previous_active_addresses',
  /** column name */
  RepeatableAddresses = 'repeatable_addresses',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  Txs = 'txs',
  /** column name */
  TxsDiff = 'txs_diff',
}

/** aggregate stddev on columns */
export type Flat_Blockchain_Stats_Stddev_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Stddev_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchain_Stats_Stddev_Pop_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Stddev_Pop_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchain_Stats_Stddev_Samp_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Stddev_Samp_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchain_Stats_Sum_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Int']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_percent?: Maybe<Scalars['numeric']>;
  ibc_current_active_addresses?: Maybe<Scalars['Int']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Int']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Int']>;
  previous_active_addresses?: Maybe<Scalars['Int']>;
  repeatable_addresses?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs?: Maybe<Scalars['Int']>;
  txs_diff?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Sum_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchain_Stats_Var_Pop_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Var_Pop_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchain_Stats_Var_Samp_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Var_Samp_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchain_Stats_Variance_Fields = {
  active_addresses_cnt?: Maybe<Scalars['Float']>;
  active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_percent?: Maybe<Scalars['Float']>;
  ibc_current_active_addresses?: Maybe<Scalars['Float']>;
  ibc_previous_active_addresses?: Maybe<Scalars['Float']>;
  ibc_repeatable_addresses?: Maybe<Scalars['Float']>;
  previous_active_addresses?: Maybe<Scalars['Float']>;
  repeatable_addresses?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs?: Maybe<Scalars['Float']>;
  txs_diff?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchain_stats" */
export type Flat_Blockchain_Stats_Variance_Order_By = {
  active_addresses_cnt?: InputMaybe<Order_By>;
  active_addresses_cnt_diff?: InputMaybe<Order_By>;
  current_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_percent?: InputMaybe<Order_By>;
  ibc_current_active_addresses?: InputMaybe<Order_By>;
  ibc_previous_active_addresses?: InputMaybe<Order_By>;
  ibc_repeatable_addresses?: InputMaybe<Order_By>;
  previous_active_addresses?: InputMaybe<Order_By>;
  repeatable_addresses?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs?: InputMaybe<Order_By>;
  txs_diff?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats = {
  active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchainByBlockchain: Flat_Blockchains;
  /** An array relationship */
  blockchain_tf_switched_charts: Array<Flat_Blockchain_Tf_Switched_Charts>;
  /** An aggregated array relationship */
  blockchain_tf_switched_charts_aggregate: Flat_Blockchain_Tf_Switched_Charts_Aggregate;
  channels_cnt: Scalars['Int'];
  ibc_active_addresses_cnt_rating: Scalars['Int'];
  ibc_active_addresses_cnt_rating_diff: Scalars['Int'];
  ibc_cashflow: Scalars['bigint'];
  ibc_cashflow_diff: Scalars['bigint'];
  ibc_cashflow_in: Scalars['bigint'];
  ibc_cashflow_in_diff: Scalars['bigint'];
  ibc_cashflow_in_pending: Scalars['bigint'];
  ibc_cashflow_in_percent: Scalars['numeric'];
  ibc_cashflow_in_rating: Scalars['Int'];
  ibc_cashflow_in_rating_diff: Scalars['Int'];
  ibc_cashflow_out: Scalars['bigint'];
  ibc_cashflow_out_diff: Scalars['bigint'];
  ibc_cashflow_out_pending: Scalars['bigint'];
  ibc_cashflow_out_percent: Scalars['numeric'];
  ibc_cashflow_out_rating: Scalars['Int'];
  ibc_cashflow_out_rating_diff: Scalars['Int'];
  ibc_cashflow_pending: Scalars['bigint'];
  ibc_cashflow_rating: Scalars['Int'];
  ibc_cashflow_rating_diff: Scalars['Int'];
  ibc_peers: Scalars['Int'];
  ibc_transfers: Scalars['Int'];
  ibc_transfers_diff: Scalars['Int'];
  ibc_transfers_pending: Scalars['Int'];
  ibc_transfers_rating: Scalars['Int'];
  ibc_transfers_rating_diff: Scalars['Int'];
  ibc_transfers_success_rate: Scalars['numeric'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
  /** An object relationship */
  timeframeByTimeframe: Flat_Timeframes;
  txs_rating: Scalars['Int'];
  txs_rating_diff: Scalars['Int'];
};

/** columns and relationships of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_StatsBlockchain_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_StatsBlockchain_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Switched_Stats_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Switched_Stats>;
};

/** aggregate fields of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchain_Switched_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Switched_Stats_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Switched_Stats_Min_Fields>;
  stddev?: Maybe<Flat_Blockchain_Switched_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchain_Switched_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchain_Switched_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchain_Switched_Stats_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchain_Switched_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchain_Switched_Stats_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchain_Switched_Stats_Variance_Fields>;
};

/** aggregate fields of "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchain_Switched_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Switched_Stats_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Switched_Stats_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchain_Switched_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchain_Switched_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchain_Switched_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchain_Switched_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchain_Switched_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchain_Switched_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchain_Switched_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchain_Switched_Stats_Avg_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Avg_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_switched_stats". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Switched_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>>>;
  active_addresses_cnt_rating?: InputMaybe<Int_Comparison_Exp>;
  active_addresses_cnt_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchain_tf_switched_charts?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
  channels_cnt?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_in_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_out_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_peers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_success_rate?: InputMaybe<Numeric_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Bool_Exp>;
  txs_rating?: InputMaybe<Int_Comparison_Exp>;
  txs_rating_diff?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Switched_Stats_Max_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  blockchain?: Maybe<Scalars['String']>;
  channels_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs_rating?: Maybe<Scalars['Int']>;
  txs_rating_diff?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Max_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Switched_Stats_Min_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  blockchain?: Maybe<Scalars['String']>;
  channels_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs_rating?: Maybe<Scalars['Int']>;
  txs_rating_diff?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Min_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchain_tf_switched_charts_aggregate?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Aggregate_Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.blockchain_switched_stats" */
export const enum Flat_Blockchain_Switched_Stats_Select_Column {
  /** column name */
  ActiveAddressesCntRating = 'active_addresses_cnt_rating',
  /** column name */
  ActiveAddressesCntRatingDiff = 'active_addresses_cnt_rating_diff',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  ChannelsCnt = 'channels_cnt',
  /** column name */
  IbcActiveAddressesCntRating = 'ibc_active_addresses_cnt_rating',
  /** column name */
  IbcActiveAddressesCntRatingDiff = 'ibc_active_addresses_cnt_rating_diff',
  /** column name */
  IbcCashflow = 'ibc_cashflow',
  /** column name */
  IbcCashflowDiff = 'ibc_cashflow_diff',
  /** column name */
  IbcCashflowIn = 'ibc_cashflow_in',
  /** column name */
  IbcCashflowInDiff = 'ibc_cashflow_in_diff',
  /** column name */
  IbcCashflowInPending = 'ibc_cashflow_in_pending',
  /** column name */
  IbcCashflowInPercent = 'ibc_cashflow_in_percent',
  /** column name */
  IbcCashflowInRating = 'ibc_cashflow_in_rating',
  /** column name */
  IbcCashflowInRatingDiff = 'ibc_cashflow_in_rating_diff',
  /** column name */
  IbcCashflowOut = 'ibc_cashflow_out',
  /** column name */
  IbcCashflowOutDiff = 'ibc_cashflow_out_diff',
  /** column name */
  IbcCashflowOutPending = 'ibc_cashflow_out_pending',
  /** column name */
  IbcCashflowOutPercent = 'ibc_cashflow_out_percent',
  /** column name */
  IbcCashflowOutRating = 'ibc_cashflow_out_rating',
  /** column name */
  IbcCashflowOutRatingDiff = 'ibc_cashflow_out_rating_diff',
  /** column name */
  IbcCashflowPending = 'ibc_cashflow_pending',
  /** column name */
  IbcCashflowRating = 'ibc_cashflow_rating',
  /** column name */
  IbcCashflowRatingDiff = 'ibc_cashflow_rating_diff',
  /** column name */
  IbcPeers = 'ibc_peers',
  /** column name */
  IbcTransfers = 'ibc_transfers',
  /** column name */
  IbcTransfersDiff = 'ibc_transfers_diff',
  /** column name */
  IbcTransfersPending = 'ibc_transfers_pending',
  /** column name */
  IbcTransfersRating = 'ibc_transfers_rating',
  /** column name */
  IbcTransfersRatingDiff = 'ibc_transfers_rating_diff',
  /** column name */
  IbcTransfersSuccessRate = 'ibc_transfers_success_rate',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  TxsRating = 'txs_rating',
  /** column name */
  TxsRatingDiff = 'txs_rating_diff',
}

/** aggregate stddev on columns */
export type Flat_Blockchain_Switched_Stats_Stddev_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Stddev_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchain_Switched_Stats_Stddev_Pop_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Stddev_Pop_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchain_Switched_Stats_Stddev_Samp_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Stddev_Samp_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchain_Switched_Stats_Sum_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  channels_cnt?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  txs_rating?: Maybe<Scalars['Int']>;
  txs_rating_diff?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Sum_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchain_Switched_Stats_Var_Pop_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Var_Pop_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchain_Switched_Stats_Var_Samp_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Var_Samp_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchain_Switched_Stats_Variance_Fields = {
  active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  channels_cnt?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_cnt_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  txs_rating?: Maybe<Scalars['Float']>;
  txs_rating_diff?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchain_switched_stats" */
export type Flat_Blockchain_Switched_Stats_Variance_Order_By = {
  active_addresses_cnt_rating?: InputMaybe<Order_By>;
  active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  channels_cnt?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_cnt_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  txs_rating?: InputMaybe<Order_By>;
  txs_rating_diff?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type = {
  /** An array relationship */
  blockchain_tf_charts: Array<Flat_Blockchain_Tf_Charts>;
  /** An aggregated array relationship */
  blockchain_tf_charts_aggregate: Flat_Blockchain_Tf_Charts_Aggregate;
  chart_type: Scalars['String'];
};

/** columns and relationships of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_TypeBlockchain_Tf_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_TypeBlockchain_Tf_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Tf_Chart_Type_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Tf_Chart_Type>;
};

/** aggregate fields of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Aggregate_Fields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Tf_Chart_Type_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Tf_Chart_Type_Min_Fields>;
};

/** aggregate fields of "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_tf_chart_type". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Tf_Chart_Type_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>>>;
  blockchain_tf_charts?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Tf_Chart_Type_Max_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Max_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Tf_Chart_Type_Min_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Min_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Order_By = {
  blockchain_tf_charts_aggregate?: InputMaybe<Flat_Blockchain_Tf_Charts_Aggregate_Order_By>;
  chart_type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_tf_chart_type" */
export type Flat_Blockchain_Tf_Chart_Type_Pk_Columns_Input = {
  chart_type: Scalars['String'];
};

/** select columns of table "flat.blockchain_tf_chart_type" */
export const enum Flat_Blockchain_Tf_Chart_Type_Select_Column {
  /** column name */
  ChartType = 'chart_type',
}

/** columns and relationships of "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts = {
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchain_stat?: Maybe<Flat_Blockchain_Stats>;
  /** An object relationship */
  blockchain_tf_chart_type: Flat_Blockchain_Tf_Chart_Type;
  chart_type: Scalars['String'];
  point_index: Scalars['Int'];
  point_value?: Maybe<Scalars['numeric']>;
  timeframe: Scalars['Int'];
};

/** aggregated selection of "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Tf_Charts_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Tf_Charts>;
};

/** aggregate fields of "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchain_Tf_Charts_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Tf_Charts_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Tf_Charts_Min_Fields>;
  stddev?: Maybe<Flat_Blockchain_Tf_Charts_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchain_Tf_Charts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchain_Tf_Charts_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchain_Tf_Charts_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchain_Tf_Charts_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchain_Tf_Charts_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchain_Tf_Charts_Variance_Fields>;
};

/** aggregate fields of "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchain_Tf_Charts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Tf_Charts_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Tf_Charts_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchain_Tf_Charts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchain_Tf_Charts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchain_Tf_Charts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchain_Tf_Charts_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchain_Tf_Charts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchain_Tf_Charts_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchain_Tf_Charts_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchain_Tf_Charts_Avg_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Avg_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_tf_charts". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Tf_Charts_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>>>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchain_stat?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
  blockchain_tf_chart_type?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  point_index?: InputMaybe<Int_Comparison_Exp>;
  point_value?: InputMaybe<Numeric_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Tf_Charts_Max_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Max_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Tf_Charts_Min_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Min_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  blockchain_stat?: InputMaybe<Flat_Blockchain_Stats_Order_By>;
  blockchain_tf_chart_type?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Order_By>;
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.blockchain_tf_charts" */
export const enum Flat_Blockchain_Tf_Charts_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  ChartType = 'chart_type',
  /** column name */
  PointIndex = 'point_index',
  /** column name */
  PointValue = 'point_value',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Flat_Blockchain_Tf_Charts_Stddev_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Stddev_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchain_Tf_Charts_Stddev_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Stddev_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchain_Tf_Charts_Stddev_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Stddev_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchain_Tf_Charts_Sum_Fields = {
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Sum_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchain_Tf_Charts_Var_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Var_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchain_Tf_Charts_Var_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Var_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchain_Tf_Charts_Variance_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchain_tf_charts" */
export type Flat_Blockchain_Tf_Charts_Variance_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type = {
  /** An array relationship */
  blockchain_tf_switched_charts: Array<Flat_Blockchain_Tf_Switched_Charts>;
  /** An aggregated array relationship */
  blockchain_tf_switched_charts_aggregate: Flat_Blockchain_Tf_Switched_Charts_Aggregate;
  chart_type: Scalars['String'];
};

/** columns and relationships of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_TypeBlockchain_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_TypeBlockchain_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Tf_Switched_Chart_Type>;
};

/** aggregate fields of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate_Fields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Tf_Switched_Chart_Type_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Tf_Switched_Chart_Type_Min_Fields>;
};

/** aggregate fields of "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_tf_switched_chart_type". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>>>;
  blockchain_tf_switched_charts?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Max_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Max_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Min_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Min_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Order_By = {
  blockchain_tf_switched_charts_aggregate?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Aggregate_Order_By>;
  chart_type?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_tf_switched_chart_type" */
export type Flat_Blockchain_Tf_Switched_Chart_Type_Pk_Columns_Input = {
  chart_type: Scalars['String'];
};

/** select columns of table "flat.blockchain_tf_switched_chart_type" */
export const enum Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column {
  /** column name */
  ChartType = 'chart_type',
}

/** columns and relationships of "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts = {
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchain_switched_stat?: Maybe<Flat_Blockchain_Switched_Stats>;
  /** An object relationship */
  blockchain_tf_switched_chart_type: Flat_Blockchain_Tf_Switched_Chart_Type;
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  point_value?: Maybe<Scalars['numeric']>;
  timeframe: Scalars['Int'];
};

/** aggregated selection of "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Aggregate = {
  aggregate?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Aggregate_Fields>;
  nodes: Array<Flat_Blockchain_Tf_Switched_Charts>;
};

/** aggregate fields of "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Max_Fields>;
  min?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Min_Fields>;
  stddev?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchain_Tf_Switched_Charts_Variance_Fields>;
};

/** aggregate fields of "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Avg_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Avg_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchain_tf_switched_charts". All fields are combined with a logical 'AND'. */
export type Flat_Blockchain_Tf_Switched_Charts_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>>>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchain_switched_stat?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
  blockchain_tf_switched_chart_type?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  point_index?: InputMaybe<Int_Comparison_Exp>;
  point_value?: InputMaybe<Numeric_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Max_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Max_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Min_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Min_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  blockchain_switched_stat?: InputMaybe<Flat_Blockchain_Switched_Stats_Order_By>;
  blockchain_tf_switched_chart_type?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Order_By>;
  chart_type?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.blockchain_tf_switched_charts" */
export const enum Flat_Blockchain_Tf_Switched_Charts_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  ChartType = 'chart_type',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  PointIndex = 'point_index',
  /** column name */
  PointValue = 'point_value',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Stddev_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Sum_Fields = {
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Sum_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Var_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Var_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Var_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Var_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchain_Tf_Switched_Charts_Variance_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchain_tf_switched_charts" */
export type Flat_Blockchain_Tf_Switched_Charts_Variance_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_Blockchains = {
  base_token?: Maybe<Scalars['String']>;
  /** An array relationship */
  blockchainRelationsByBlockchainTarget: Array<Flat_Blockchain_Relations>;
  /** An aggregated array relationship */
  blockchainRelationsByBlockchainTarget_aggregate: Flat_Blockchain_Relations_Aggregate;
  /** An array relationship */
  blockchain_relations: Array<Flat_Blockchain_Relations>;
  /** An aggregated array relationship */
  blockchain_relations_aggregate: Flat_Blockchain_Relations_Aggregate;
  /** An array relationship */
  blockchain_stats: Array<Flat_Blockchain_Stats>;
  /** An aggregated array relationship */
  blockchain_stats_aggregate: Flat_Blockchain_Stats_Aggregate;
  /** An array relationship */
  blockchain_switched_stats: Array<Flat_Blockchain_Switched_Stats>;
  /** An aggregated array relationship */
  blockchain_switched_stats_aggregate: Flat_Blockchain_Switched_Stats_Aggregate;
  bonded_tokens?: Maybe<Scalars['numeric']>;
  bonded_tokens_percent?: Maybe<Scalars['numeric']>;
  /** An array relationship */
  channelsStatsByCounterpartyBlockchain: Array<Flat_Channels_Stats>;
  /** An aggregated array relationship */
  channelsStatsByCounterpartyBlockchain_aggregate: Flat_Channels_Stats_Aggregate;
  /** An array relationship */
  channels_stats: Array<Flat_Channels_Stats>;
  /** An aggregated array relationship */
  channels_stats_aggregate: Flat_Channels_Stats_Aggregate;
  inflation?: Maybe<Scalars['numeric']>;
  is_mainnet: Scalars['Boolean'];
  is_synced?: Maybe<Scalars['Boolean']>;
  logo_url?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  network_id: Scalars['String'];
  nodes_cnt?: Maybe<Scalars['Int']>;
  staking_apr?: Maybe<Scalars['numeric']>;
  /** An object relationship */
  token?: Maybe<Flat_Tokens>;
  /** An array relationship */
  tokens: Array<Flat_Tokens>;
  /** An aggregated array relationship */
  tokens_aggregate: Flat_Tokens_Aggregate;
  unbonding_period?: Maybe<Scalars['Int']>;
  validators_cnt?: Maybe<Scalars['Int']>;
  website?: Maybe<Scalars['String']>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchainRelationsByBlockchainTargetArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchainRelationsByBlockchainTarget_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_RelationsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_Relations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_Switched_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsBlockchain_Switched_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsChannelsStatsByCounterpartyBlockchainArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsChannelsStatsByCounterpartyBlockchain_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsChannels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsChannels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsTokensArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** columns and relationships of "flat.blockchains" */
export type Flat_BlockchainsTokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** aggregated selection of "flat.blockchains" */
export type Flat_Blockchains_Aggregate = {
  aggregate?: Maybe<Flat_Blockchains_Aggregate_Fields>;
  nodes: Array<Flat_Blockchains>;
};

/** aggregate fields of "flat.blockchains" */
export type Flat_Blockchains_Aggregate_Fields = {
  avg?: Maybe<Flat_Blockchains_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Blockchains_Max_Fields>;
  min?: Maybe<Flat_Blockchains_Min_Fields>;
  stddev?: Maybe<Flat_Blockchains_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Blockchains_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Blockchains_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Blockchains_Sum_Fields>;
  var_pop?: Maybe<Flat_Blockchains_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Blockchains_Var_Samp_Fields>;
  variance?: Maybe<Flat_Blockchains_Variance_Fields>;
};

/** aggregate fields of "flat.blockchains" */
export type Flat_Blockchains_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.blockchains" */
export type Flat_Blockchains_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Blockchains_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Blockchains_Max_Order_By>;
  min?: InputMaybe<Flat_Blockchains_Min_Order_By>;
  stddev?: InputMaybe<Flat_Blockchains_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Blockchains_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Blockchains_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Blockchains_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Blockchains_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Blockchains_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Blockchains_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Blockchains_Avg_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Avg_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.blockchains". All fields are combined with a logical 'AND'. */
export type Flat_Blockchains_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Blockchains_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Blockchains_Bool_Exp>>>;
  base_token?: InputMaybe<String_Comparison_Exp>;
  blockchainRelationsByBlockchainTarget?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
  blockchain_relations?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
  blockchain_stats?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
  blockchain_switched_stats?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
  bonded_tokens?: InputMaybe<Numeric_Comparison_Exp>;
  bonded_tokens_percent?: InputMaybe<Numeric_Comparison_Exp>;
  channelsStatsByCounterpartyBlockchain?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
  channels_stats?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
  inflation?: InputMaybe<Numeric_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  is_synced?: InputMaybe<Boolean_Comparison_Exp>;
  logo_url?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  network_id?: InputMaybe<String_Comparison_Exp>;
  nodes_cnt?: InputMaybe<Int_Comparison_Exp>;
  staking_apr?: InputMaybe<Numeric_Comparison_Exp>;
  token?: InputMaybe<Flat_Tokens_Bool_Exp>;
  tokens?: InputMaybe<Flat_Tokens_Bool_Exp>;
  unbonding_period?: InputMaybe<Int_Comparison_Exp>;
  validators_cnt?: InputMaybe<Int_Comparison_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Blockchains_Max_Fields = {
  base_token?: Maybe<Scalars['String']>;
  bonded_tokens?: Maybe<Scalars['numeric']>;
  bonded_tokens_percent?: Maybe<Scalars['numeric']>;
  inflation?: Maybe<Scalars['numeric']>;
  logo_url?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  network_id?: Maybe<Scalars['String']>;
  nodes_cnt?: Maybe<Scalars['Int']>;
  staking_apr?: Maybe<Scalars['numeric']>;
  unbonding_period?: Maybe<Scalars['Int']>;
  validators_cnt?: Maybe<Scalars['Int']>;
  website?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Max_Order_By = {
  base_token?: InputMaybe<Order_By>;
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  network_id?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Blockchains_Min_Fields = {
  base_token?: Maybe<Scalars['String']>;
  bonded_tokens?: Maybe<Scalars['numeric']>;
  bonded_tokens_percent?: Maybe<Scalars['numeric']>;
  inflation?: Maybe<Scalars['numeric']>;
  logo_url?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  network_id?: Maybe<Scalars['String']>;
  nodes_cnt?: Maybe<Scalars['Int']>;
  staking_apr?: Maybe<Scalars['numeric']>;
  unbonding_period?: Maybe<Scalars['Int']>;
  validators_cnt?: Maybe<Scalars['Int']>;
  website?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Min_Order_By = {
  base_token?: InputMaybe<Order_By>;
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  network_id?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.blockchains" */
export type Flat_Blockchains_Order_By = {
  base_token?: InputMaybe<Order_By>;
  blockchainRelationsByBlockchainTarget_aggregate?: InputMaybe<Flat_Blockchain_Relations_Aggregate_Order_By>;
  blockchain_relations_aggregate?: InputMaybe<Flat_Blockchain_Relations_Aggregate_Order_By>;
  blockchain_stats_aggregate?: InputMaybe<Flat_Blockchain_Stats_Aggregate_Order_By>;
  blockchain_switched_stats_aggregate?: InputMaybe<Flat_Blockchain_Switched_Stats_Aggregate_Order_By>;
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  channelsStatsByCounterpartyBlockchain_aggregate?: InputMaybe<Flat_Channels_Stats_Aggregate_Order_By>;
  channels_stats_aggregate?: InputMaybe<Flat_Channels_Stats_Aggregate_Order_By>;
  inflation?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  is_synced?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  network_id?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  token?: InputMaybe<Flat_Tokens_Order_By>;
  tokens_aggregate?: InputMaybe<Flat_Tokens_Aggregate_Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.blockchains" */
export type Flat_Blockchains_Pk_Columns_Input = {
  network_id: Scalars['String'];
};

/** select columns of table "flat.blockchains" */
export const enum Flat_Blockchains_Select_Column {
  /** column name */
  BaseToken = 'base_token',
  /** column name */
  BondedTokens = 'bonded_tokens',
  /** column name */
  BondedTokensPercent = 'bonded_tokens_percent',
  /** column name */
  Inflation = 'inflation',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  IsSynced = 'is_synced',
  /** column name */
  LogoUrl = 'logo_url',
  /** column name */
  Name = 'name',
  /** column name */
  NetworkId = 'network_id',
  /** column name */
  NodesCnt = 'nodes_cnt',
  /** column name */
  StakingApr = 'staking_apr',
  /** column name */
  UnbondingPeriod = 'unbonding_period',
  /** column name */
  ValidatorsCnt = 'validators_cnt',
  /** column name */
  Website = 'website',
}

/** aggregate stddev on columns */
export type Flat_Blockchains_Stddev_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Stddev_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Blockchains_Stddev_Pop_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Stddev_Pop_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Blockchains_Stddev_Samp_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Stddev_Samp_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Blockchains_Sum_Fields = {
  bonded_tokens?: Maybe<Scalars['numeric']>;
  bonded_tokens_percent?: Maybe<Scalars['numeric']>;
  inflation?: Maybe<Scalars['numeric']>;
  nodes_cnt?: Maybe<Scalars['Int']>;
  staking_apr?: Maybe<Scalars['numeric']>;
  unbonding_period?: Maybe<Scalars['Int']>;
  validators_cnt?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Sum_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Blockchains_Var_Pop_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Var_Pop_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Blockchains_Var_Samp_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Var_Samp_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Blockchains_Variance_Fields = {
  bonded_tokens?: Maybe<Scalars['Float']>;
  bonded_tokens_percent?: Maybe<Scalars['Float']>;
  inflation?: Maybe<Scalars['Float']>;
  nodes_cnt?: Maybe<Scalars['Float']>;
  staking_apr?: Maybe<Scalars['Float']>;
  unbonding_period?: Maybe<Scalars['Float']>;
  validators_cnt?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.blockchains" */
export type Flat_Blockchains_Variance_Order_By = {
  bonded_tokens?: InputMaybe<Order_By>;
  bonded_tokens_percent?: InputMaybe<Order_By>;
  inflation?: InputMaybe<Order_By>;
  nodes_cnt?: InputMaybe<Order_By>;
  staking_apr?: InputMaybe<Order_By>;
  unbonding_period?: InputMaybe<Order_By>;
  validators_cnt?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.channels_stats" */
export type Flat_Channels_Stats = {
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchainByBlockchain: Flat_Blockchains;
  /** An object relationship */
  blockchainByCounterpartyBlockchain: Flat_Blockchains;
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  counterparty_blockchain: Scalars['String'];
  counterparty_channel_id?: Maybe<Scalars['String']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in: Scalars['bigint'];
  ibc_cashflow_in_diff: Scalars['bigint'];
  ibc_cashflow_in_pending: Scalars['bigint'];
  ibc_cashflow_out: Scalars['bigint'];
  ibc_cashflow_out_diff: Scalars['bigint'];
  ibc_cashflow_out_pending: Scalars['bigint'];
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers: Scalars['Int'];
  ibc_transfers_diff: Scalars['Int'];
  ibc_transfers_failed: Scalars['Int'];
  ibc_transfers_failed_diff: Scalars['Int'];
  ibc_transfers_pending: Scalars['Int'];
  ibc_transfers_success_rate: Scalars['numeric'];
  ibc_transfers_success_rate_diff: Scalars['numeric'];
  is_channel_open: Scalars['Boolean'];
  timeframe: Scalars['Int'];
  /** An object relationship */
  timeframeByTimeframe: Flat_Timeframes;
};

/** aggregated selection of "flat.channels_stats" */
export type Flat_Channels_Stats_Aggregate = {
  aggregate?: Maybe<Flat_Channels_Stats_Aggregate_Fields>;
  nodes: Array<Flat_Channels_Stats>;
};

/** aggregate fields of "flat.channels_stats" */
export type Flat_Channels_Stats_Aggregate_Fields = {
  avg?: Maybe<Flat_Channels_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Channels_Stats_Max_Fields>;
  min?: Maybe<Flat_Channels_Stats_Min_Fields>;
  stddev?: Maybe<Flat_Channels_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Channels_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Channels_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Channels_Stats_Sum_Fields>;
  var_pop?: Maybe<Flat_Channels_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Channels_Stats_Var_Samp_Fields>;
  variance?: Maybe<Flat_Channels_Stats_Variance_Fields>;
};

/** aggregate fields of "flat.channels_stats" */
export type Flat_Channels_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.channels_stats" */
export type Flat_Channels_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Channels_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Channels_Stats_Max_Order_By>;
  min?: InputMaybe<Flat_Channels_Stats_Min_Order_By>;
  stddev?: InputMaybe<Flat_Channels_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Channels_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Channels_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Channels_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Channels_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Channels_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Channels_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Channels_Stats_Avg_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Avg_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.channels_stats". All fields are combined with a logical 'AND'. */
export type Flat_Channels_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Channels_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Channels_Stats_Bool_Exp>>>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchainByCounterpartyBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  channel_id?: InputMaybe<String_Comparison_Exp>;
  client_id?: InputMaybe<String_Comparison_Exp>;
  connection_id?: InputMaybe<String_Comparison_Exp>;
  counterparty_blockchain?: InputMaybe<String_Comparison_Exp>;
  counterparty_channel_id?: InputMaybe<String_Comparison_Exp>;
  ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_failed_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_success_rate?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_transfers_success_rate_diff?: InputMaybe<Numeric_Comparison_Exp>;
  is_channel_open?: InputMaybe<Boolean_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Channels_Stats_Max_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  counterparty_blockchain?: Maybe<Scalars['String']>;
  counterparty_channel_id?: Maybe<Scalars['String']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Max_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  counterparty_blockchain?: InputMaybe<Order_By>;
  counterparty_channel_id?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Channels_Stats_Min_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  counterparty_blockchain?: Maybe<Scalars['String']>;
  counterparty_channel_id?: Maybe<Scalars['String']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Min_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  counterparty_blockchain?: InputMaybe<Order_By>;
  counterparty_channel_id?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.channels_stats" */
export type Flat_Channels_Stats_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchainByCounterpartyBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  counterparty_blockchain?: InputMaybe<Order_By>;
  counterparty_channel_id?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  is_channel_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Order_By>;
};

/** primary key columns input for table: "flat.channels_stats" */
export type Flat_Channels_Stats_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  channel_id: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.channels_stats" */
export const enum Flat_Channels_Stats_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  ChannelId = 'channel_id',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  ConnectionId = 'connection_id',
  /** column name */
  CounterpartyBlockchain = 'counterparty_blockchain',
  /** column name */
  CounterpartyChannelId = 'counterparty_channel_id',
  /** column name */
  IbcCashflow = 'ibc_cashflow',
  /** column name */
  IbcCashflowDiff = 'ibc_cashflow_diff',
  /** column name */
  IbcCashflowIn = 'ibc_cashflow_in',
  /** column name */
  IbcCashflowInDiff = 'ibc_cashflow_in_diff',
  /** column name */
  IbcCashflowInPending = 'ibc_cashflow_in_pending',
  /** column name */
  IbcCashflowOut = 'ibc_cashflow_out',
  /** column name */
  IbcCashflowOutDiff = 'ibc_cashflow_out_diff',
  /** column name */
  IbcCashflowOutPending = 'ibc_cashflow_out_pending',
  /** column name */
  IbcCashflowPending = 'ibc_cashflow_pending',
  /** column name */
  IbcTransfers = 'ibc_transfers',
  /** column name */
  IbcTransfersDiff = 'ibc_transfers_diff',
  /** column name */
  IbcTransfersFailed = 'ibc_transfers_failed',
  /** column name */
  IbcTransfersFailedDiff = 'ibc_transfers_failed_diff',
  /** column name */
  IbcTransfersPending = 'ibc_transfers_pending',
  /** column name */
  IbcTransfersSuccessRate = 'ibc_transfers_success_rate',
  /** column name */
  IbcTransfersSuccessRateDiff = 'ibc_transfers_success_rate_diff',
  /** column name */
  IsChannelOpen = 'is_channel_open',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Flat_Channels_Stats_Stddev_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Stddev_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Channels_Stats_Stddev_Pop_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Stddev_Pop_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Channels_Stats_Stddev_Samp_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Stddev_Samp_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Channels_Stats_Sum_Fields = {
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_failed?: Maybe<Scalars['Int']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_success_rate?: Maybe<Scalars['numeric']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Sum_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Channels_Stats_Var_Pop_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Var_Pop_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Channels_Stats_Var_Samp_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Var_Samp_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Channels_Stats_Variance_Fields = {
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate?: Maybe<Scalars['Float']>;
  ibc_transfers_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.channels_stats" */
export type Flat_Channels_Stats_Variance_Order_By = {
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed?: InputMaybe<Order_By>;
  ibc_transfers_failed_diff?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_success_rate?: InputMaybe<Order_By>;
  ibc_transfers_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.defillama_txs" */
export type Flat_Defillama_Txs = {
  base_denom: Scalars['String'];
  base_denom_zone?: Maybe<Scalars['String']>;
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchainByBlockchain: Flat_Blockchains;
  destination_address: Scalars['String'];
  height: Scalars['bigint'];
  source_address: Scalars['String'];
  timestamp: Scalars['timestamp'];
  /** An object relationship */
  token?: Maybe<Flat_Tokens>;
  tx_hash: Scalars['String'];
  tx_type: Scalars['String'];
  usd_value?: Maybe<Scalars['numeric']>;
};

/** aggregated selection of "flat.defillama_txs" */
export type Flat_Defillama_Txs_Aggregate = {
  aggregate?: Maybe<Flat_Defillama_Txs_Aggregate_Fields>;
  nodes: Array<Flat_Defillama_Txs>;
};

/** aggregate fields of "flat.defillama_txs" */
export type Flat_Defillama_Txs_Aggregate_Fields = {
  avg?: Maybe<Flat_Defillama_Txs_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Defillama_Txs_Max_Fields>;
  min?: Maybe<Flat_Defillama_Txs_Min_Fields>;
  stddev?: Maybe<Flat_Defillama_Txs_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Defillama_Txs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Defillama_Txs_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Defillama_Txs_Sum_Fields>;
  var_pop?: Maybe<Flat_Defillama_Txs_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Defillama_Txs_Var_Samp_Fields>;
  variance?: Maybe<Flat_Defillama_Txs_Variance_Fields>;
};

/** aggregate fields of "flat.defillama_txs" */
export type Flat_Defillama_Txs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Defillama_Txs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Defillama_Txs_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Defillama_Txs_Max_Order_By>;
  min?: InputMaybe<Flat_Defillama_Txs_Min_Order_By>;
  stddev?: InputMaybe<Flat_Defillama_Txs_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Defillama_Txs_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Defillama_Txs_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Defillama_Txs_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Defillama_Txs_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Defillama_Txs_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Defillama_Txs_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Defillama_Txs_Avg_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Avg_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.defillama_txs". All fields are combined with a logical 'AND'. */
export type Flat_Defillama_Txs_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Defillama_Txs_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Defillama_Txs_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Defillama_Txs_Bool_Exp>>>;
  base_denom?: InputMaybe<String_Comparison_Exp>;
  base_denom_zone?: InputMaybe<String_Comparison_Exp>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  destination_address?: InputMaybe<String_Comparison_Exp>;
  height?: InputMaybe<Bigint_Comparison_Exp>;
  source_address?: InputMaybe<String_Comparison_Exp>;
  timestamp?: InputMaybe<Timestamp_Comparison_Exp>;
  token?: InputMaybe<Flat_Tokens_Bool_Exp>;
  tx_hash?: InputMaybe<String_Comparison_Exp>;
  tx_type?: InputMaybe<String_Comparison_Exp>;
  usd_value?: InputMaybe<Numeric_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Defillama_Txs_Max_Fields = {
  base_denom?: Maybe<Scalars['String']>;
  base_denom_zone?: Maybe<Scalars['String']>;
  blockchain?: Maybe<Scalars['String']>;
  destination_address?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['bigint']>;
  source_address?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['timestamp']>;
  tx_hash?: Maybe<Scalars['String']>;
  tx_type?: Maybe<Scalars['String']>;
  usd_value?: Maybe<Scalars['numeric']>;
};

/** order by max() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Max_Order_By = {
  base_denom?: InputMaybe<Order_By>;
  base_denom_zone?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  destination_address?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  source_address?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  tx_hash?: InputMaybe<Order_By>;
  tx_type?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Defillama_Txs_Min_Fields = {
  base_denom?: Maybe<Scalars['String']>;
  base_denom_zone?: Maybe<Scalars['String']>;
  blockchain?: Maybe<Scalars['String']>;
  destination_address?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['bigint']>;
  source_address?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['timestamp']>;
  tx_hash?: Maybe<Scalars['String']>;
  tx_type?: Maybe<Scalars['String']>;
  usd_value?: Maybe<Scalars['numeric']>;
};

/** order by min() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Min_Order_By = {
  base_denom?: InputMaybe<Order_By>;
  base_denom_zone?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  destination_address?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  source_address?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  tx_hash?: InputMaybe<Order_By>;
  tx_type?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.defillama_txs" */
export type Flat_Defillama_Txs_Order_By = {
  base_denom?: InputMaybe<Order_By>;
  base_denom_zone?: InputMaybe<Order_By>;
  blockchain?: InputMaybe<Order_By>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  destination_address?: InputMaybe<Order_By>;
  height?: InputMaybe<Order_By>;
  source_address?: InputMaybe<Order_By>;
  timestamp?: InputMaybe<Order_By>;
  token?: InputMaybe<Flat_Tokens_Order_By>;
  tx_hash?: InputMaybe<Order_By>;
  tx_type?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.defillama_txs" */
export type Flat_Defillama_Txs_Pk_Columns_Input = {
  base_denom: Scalars['String'];
  blockchain: Scalars['String'];
  tx_hash: Scalars['String'];
};

/** select columns of table "flat.defillama_txs" */
export const enum Flat_Defillama_Txs_Select_Column {
  /** column name */
  BaseDenom = 'base_denom',
  /** column name */
  BaseDenomZone = 'base_denom_zone',
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  DestinationAddress = 'destination_address',
  /** column name */
  Height = 'height',
  /** column name */
  SourceAddress = 'source_address',
  /** column name */
  Timestamp = 'timestamp',
  /** column name */
  TxHash = 'tx_hash',
  /** column name */
  TxType = 'tx_type',
  /** column name */
  UsdValue = 'usd_value',
}

/** aggregate stddev on columns */
export type Flat_Defillama_Txs_Stddev_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Stddev_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Defillama_Txs_Stddev_Pop_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Stddev_Pop_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Defillama_Txs_Stddev_Samp_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Stddev_Samp_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Defillama_Txs_Sum_Fields = {
  height?: Maybe<Scalars['bigint']>;
  usd_value?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Sum_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Defillama_Txs_Var_Pop_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Var_Pop_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Defillama_Txs_Var_Samp_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Var_Samp_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Defillama_Txs_Variance_Fields = {
  height?: Maybe<Scalars['Float']>;
  usd_value?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.defillama_txs" */
export type Flat_Defillama_Txs_Variance_Order_By = {
  height?: InputMaybe<Order_By>;
  usd_value?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_Timeframes = {
  /** An array relationship */
  blockchain_relations: Array<Flat_Blockchain_Relations>;
  /** An aggregated array relationship */
  blockchain_relations_aggregate: Flat_Blockchain_Relations_Aggregate;
  /** An array relationship */
  blockchain_stats: Array<Flat_Blockchain_Stats>;
  /** An aggregated array relationship */
  blockchain_stats_aggregate: Flat_Blockchain_Stats_Aggregate;
  /** An array relationship */
  blockchain_switched_stats: Array<Flat_Blockchain_Switched_Stats>;
  /** An aggregated array relationship */
  blockchain_switched_stats_aggregate: Flat_Blockchain_Switched_Stats_Aggregate;
  /** An array relationship */
  channels_stats: Array<Flat_Channels_Stats>;
  /** An aggregated array relationship */
  channels_stats_aggregate: Flat_Channels_Stats_Aggregate;
  timeframe_in_hours: Scalars['Int'];
  /** An array relationship */
  total_tf_switched_charts: Array<Flat_Total_Tf_Switched_Charts>;
  /** An aggregated array relationship */
  total_tf_switched_charts_aggregate: Flat_Total_Tf_Switched_Charts_Aggregate;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_RelationsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_Relations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_Switched_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesBlockchain_Switched_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesChannels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesChannels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesTotal_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.timeframes" */
export type Flat_TimeframesTotal_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.timeframes" */
export type Flat_Timeframes_Aggregate = {
  aggregate?: Maybe<Flat_Timeframes_Aggregate_Fields>;
  nodes: Array<Flat_Timeframes>;
};

/** aggregate fields of "flat.timeframes" */
export type Flat_Timeframes_Aggregate_Fields = {
  avg?: Maybe<Flat_Timeframes_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Timeframes_Max_Fields>;
  min?: Maybe<Flat_Timeframes_Min_Fields>;
  stddev?: Maybe<Flat_Timeframes_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Timeframes_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Timeframes_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Timeframes_Sum_Fields>;
  var_pop?: Maybe<Flat_Timeframes_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Timeframes_Var_Samp_Fields>;
  variance?: Maybe<Flat_Timeframes_Variance_Fields>;
};

/** aggregate fields of "flat.timeframes" */
export type Flat_Timeframes_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Timeframes_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.timeframes" */
export type Flat_Timeframes_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Timeframes_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Timeframes_Max_Order_By>;
  min?: InputMaybe<Flat_Timeframes_Min_Order_By>;
  stddev?: InputMaybe<Flat_Timeframes_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Timeframes_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Timeframes_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Timeframes_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Timeframes_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Timeframes_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Timeframes_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Timeframes_Avg_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Avg_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.timeframes". All fields are combined with a logical 'AND'. */
export type Flat_Timeframes_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Timeframes_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Timeframes_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Timeframes_Bool_Exp>>>;
  blockchain_relations?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
  blockchain_stats?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
  blockchain_switched_stats?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
  channels_stats?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
  timeframe_in_hours?: InputMaybe<Int_Comparison_Exp>;
  total_tf_switched_charts?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Timeframes_Max_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Max_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Timeframes_Min_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Min_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.timeframes" */
export type Flat_Timeframes_Order_By = {
  blockchain_relations_aggregate?: InputMaybe<Flat_Blockchain_Relations_Aggregate_Order_By>;
  blockchain_stats_aggregate?: InputMaybe<Flat_Blockchain_Stats_Aggregate_Order_By>;
  blockchain_switched_stats_aggregate?: InputMaybe<Flat_Blockchain_Switched_Stats_Aggregate_Order_By>;
  channels_stats_aggregate?: InputMaybe<Flat_Channels_Stats_Aggregate_Order_By>;
  timeframe_in_hours?: InputMaybe<Order_By>;
  total_tf_switched_charts_aggregate?: InputMaybe<Flat_Total_Tf_Switched_Charts_Aggregate_Order_By>;
};

/** primary key columns input for table: "flat.timeframes" */
export type Flat_Timeframes_Pk_Columns_Input = {
  timeframe_in_hours: Scalars['Int'];
};

/** select columns of table "flat.timeframes" */
export const enum Flat_Timeframes_Select_Column {
  /** column name */
  TimeframeInHours = 'timeframe_in_hours',
}

/** aggregate stddev on columns */
export type Flat_Timeframes_Stddev_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Stddev_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Timeframes_Stddev_Pop_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Stddev_Pop_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Timeframes_Stddev_Samp_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Stddev_Samp_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Timeframes_Sum_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Sum_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Timeframes_Var_Pop_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Var_Pop_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Timeframes_Var_Samp_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Var_Samp_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Timeframes_Variance_Fields = {
  timeframe_in_hours?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.timeframes" */
export type Flat_Timeframes_Variance_Order_By = {
  timeframe_in_hours?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.token_chart_type" */
export type Flat_Token_Chart_Type = {
  chart_type: Scalars['String'];
  /** An array relationship */
  token_charts: Array<Flat_Token_Charts>;
  /** An aggregated array relationship */
  token_charts_aggregate: Flat_Token_Charts_Aggregate;
};

/** columns and relationships of "flat.token_chart_type" */
export type Flat_Token_Chart_TypeToken_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.token_chart_type" */
export type Flat_Token_Chart_TypeToken_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Aggregate = {
  aggregate?: Maybe<Flat_Token_Chart_Type_Aggregate_Fields>;
  nodes: Array<Flat_Token_Chart_Type>;
};

/** aggregate fields of "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Aggregate_Fields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Token_Chart_Type_Max_Fields>;
  min?: Maybe<Flat_Token_Chart_Type_Min_Fields>;
};

/** aggregate fields of "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Token_Chart_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Token_Chart_Type_Max_Order_By>;
  min?: InputMaybe<Flat_Token_Chart_Type_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "flat.token_chart_type". All fields are combined with a logical 'AND'. */
export type Flat_Token_Chart_Type_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Token_Chart_Type_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Token_Chart_Type_Bool_Exp>>>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  token_charts?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Token_Chart_Type_Max_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Max_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Token_Chart_Type_Min_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Min_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Order_By = {
  chart_type?: InputMaybe<Order_By>;
  token_charts_aggregate?: InputMaybe<Flat_Token_Charts_Aggregate_Order_By>;
};

/** primary key columns input for table: "flat.token_chart_type" */
export type Flat_Token_Chart_Type_Pk_Columns_Input = {
  chart_type: Scalars['String'];
};

/** select columns of table "flat.token_chart_type" */
export const enum Flat_Token_Chart_Type_Select_Column {
  /** column name */
  ChartType = 'chart_type',
}

/** columns and relationships of "flat.token_charts" */
export type Flat_Token_Charts = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  denom: Scalars['String'];
  point_index: Scalars['Int'];
  point_value?: Maybe<Scalars['numeric']>;
  /** An object relationship */
  token?: Maybe<Flat_Tokens>;
  /** An object relationship */
  token_chart_type: Flat_Token_Chart_Type;
};

/** aggregated selection of "flat.token_charts" */
export type Flat_Token_Charts_Aggregate = {
  aggregate?: Maybe<Flat_Token_Charts_Aggregate_Fields>;
  nodes: Array<Flat_Token_Charts>;
};

/** aggregate fields of "flat.token_charts" */
export type Flat_Token_Charts_Aggregate_Fields = {
  avg?: Maybe<Flat_Token_Charts_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Token_Charts_Max_Fields>;
  min?: Maybe<Flat_Token_Charts_Min_Fields>;
  stddev?: Maybe<Flat_Token_Charts_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Token_Charts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Token_Charts_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Token_Charts_Sum_Fields>;
  var_pop?: Maybe<Flat_Token_Charts_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Token_Charts_Var_Samp_Fields>;
  variance?: Maybe<Flat_Token_Charts_Variance_Fields>;
};

/** aggregate fields of "flat.token_charts" */
export type Flat_Token_Charts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.token_charts" */
export type Flat_Token_Charts_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Token_Charts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Token_Charts_Max_Order_By>;
  min?: InputMaybe<Flat_Token_Charts_Min_Order_By>;
  stddev?: InputMaybe<Flat_Token_Charts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Token_Charts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Token_Charts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Token_Charts_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Token_Charts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Token_Charts_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Token_Charts_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Token_Charts_Avg_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Avg_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.token_charts". All fields are combined with a logical 'AND'. */
export type Flat_Token_Charts_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Token_Charts_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Token_Charts_Bool_Exp>>>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  denom?: InputMaybe<String_Comparison_Exp>;
  point_index?: InputMaybe<Int_Comparison_Exp>;
  point_value?: InputMaybe<Numeric_Comparison_Exp>;
  token?: InputMaybe<Flat_Tokens_Bool_Exp>;
  token_chart_type?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Token_Charts_Max_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  denom?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
};

/** order by max() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Max_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  denom?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Token_Charts_Min_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  chart_type?: Maybe<Scalars['String']>;
  denom?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
};

/** order by min() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Min_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  denom?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.token_charts" */
export type Flat_Token_Charts_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  chart_type?: InputMaybe<Order_By>;
  denom?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  token?: InputMaybe<Flat_Tokens_Order_By>;
  token_chart_type?: InputMaybe<Flat_Token_Chart_Type_Order_By>;
};

/** primary key columns input for table: "flat.token_charts" */
export type Flat_Token_Charts_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  denom: Scalars['String'];
  point_index: Scalars['Int'];
};

/** select columns of table "flat.token_charts" */
export const enum Flat_Token_Charts_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  ChartType = 'chart_type',
  /** column name */
  Denom = 'denom',
  /** column name */
  PointIndex = 'point_index',
  /** column name */
  PointValue = 'point_value',
}

/** aggregate stddev on columns */
export type Flat_Token_Charts_Stddev_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Stddev_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Token_Charts_Stddev_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Stddev_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Token_Charts_Stddev_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Stddev_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Token_Charts_Sum_Fields = {
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Sum_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Token_Charts_Var_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Var_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Token_Charts_Var_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Var_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Token_Charts_Variance_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.token_charts" */
export type Flat_Token_Charts_Variance_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.tokens" */
export type Flat_Tokens = {
  blockchain: Scalars['String'];
  /** An object relationship */
  blockchainByBlockchain: Flat_Blockchains;
  /** An array relationship */
  blockchains: Array<Flat_Blockchains>;
  /** An aggregated array relationship */
  blockchains_aggregate: Flat_Blockchains_Aggregate;
  denom: Scalars['String'];
  logo_url?: Maybe<Scalars['String']>;
  market_cap?: Maybe<Scalars['numeric']>;
  on_chain_supply?: Maybe<Scalars['numeric']>;
  price?: Maybe<Scalars['numeric']>;
  price_day_diff_percent?: Maybe<Scalars['numeric']>;
  price_month_diff_percent?: Maybe<Scalars['numeric']>;
  price_week_diff_percent?: Maybe<Scalars['numeric']>;
  symbol?: Maybe<Scalars['String']>;
  /** An array relationship */
  token_charts: Array<Flat_Token_Charts>;
  /** An aggregated array relationship */
  token_charts_aggregate: Flat_Token_Charts_Aggregate;
  token_day_trading_volume?: Maybe<Scalars['numeric']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['numeric']>;
};

/** columns and relationships of "flat.tokens" */
export type Flat_TokensBlockchainsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** columns and relationships of "flat.tokens" */
export type Flat_TokensBlockchains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** columns and relationships of "flat.tokens" */
export type Flat_TokensToken_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.tokens" */
export type Flat_TokensToken_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.tokens" */
export type Flat_Tokens_Aggregate = {
  aggregate?: Maybe<Flat_Tokens_Aggregate_Fields>;
  nodes: Array<Flat_Tokens>;
};

/** aggregate fields of "flat.tokens" */
export type Flat_Tokens_Aggregate_Fields = {
  avg?: Maybe<Flat_Tokens_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Tokens_Max_Fields>;
  min?: Maybe<Flat_Tokens_Min_Fields>;
  stddev?: Maybe<Flat_Tokens_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Tokens_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Tokens_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Tokens_Sum_Fields>;
  var_pop?: Maybe<Flat_Tokens_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Tokens_Var_Samp_Fields>;
  variance?: Maybe<Flat_Tokens_Variance_Fields>;
};

/** aggregate fields of "flat.tokens" */
export type Flat_Tokens_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.tokens" */
export type Flat_Tokens_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Tokens_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Tokens_Max_Order_By>;
  min?: InputMaybe<Flat_Tokens_Min_Order_By>;
  stddev?: InputMaybe<Flat_Tokens_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Tokens_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Tokens_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Tokens_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Tokens_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Tokens_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Tokens_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Tokens_Avg_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.tokens" */
export type Flat_Tokens_Avg_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.tokens". All fields are combined with a logical 'AND'. */
export type Flat_Tokens_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Tokens_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Tokens_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Tokens_Bool_Exp>>>;
  blockchain?: InputMaybe<String_Comparison_Exp>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  blockchains?: InputMaybe<Flat_Blockchains_Bool_Exp>;
  denom?: InputMaybe<String_Comparison_Exp>;
  logo_url?: InputMaybe<String_Comparison_Exp>;
  market_cap?: InputMaybe<Numeric_Comparison_Exp>;
  on_chain_supply?: InputMaybe<Numeric_Comparison_Exp>;
  price?: InputMaybe<Numeric_Comparison_Exp>;
  price_day_diff_percent?: InputMaybe<Numeric_Comparison_Exp>;
  price_month_diff_percent?: InputMaybe<Numeric_Comparison_Exp>;
  price_week_diff_percent?: InputMaybe<Numeric_Comparison_Exp>;
  symbol?: InputMaybe<String_Comparison_Exp>;
  token_charts?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
  token_day_trading_volume?: InputMaybe<Numeric_Comparison_Exp>;
  token_day_trading_volume_diff_percent?: InputMaybe<Numeric_Comparison_Exp>;
};

/** aggregate max on columns */
export type Flat_Tokens_Max_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  denom?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
  market_cap?: Maybe<Scalars['numeric']>;
  on_chain_supply?: Maybe<Scalars['numeric']>;
  price?: Maybe<Scalars['numeric']>;
  price_day_diff_percent?: Maybe<Scalars['numeric']>;
  price_month_diff_percent?: Maybe<Scalars['numeric']>;
  price_week_diff_percent?: Maybe<Scalars['numeric']>;
  symbol?: Maybe<Scalars['String']>;
  token_day_trading_volume?: Maybe<Scalars['numeric']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['numeric']>;
};

/** order by max() on columns of table "flat.tokens" */
export type Flat_Tokens_Max_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  denom?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  symbol?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Tokens_Min_Fields = {
  blockchain?: Maybe<Scalars['String']>;
  denom?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
  market_cap?: Maybe<Scalars['numeric']>;
  on_chain_supply?: Maybe<Scalars['numeric']>;
  price?: Maybe<Scalars['numeric']>;
  price_day_diff_percent?: Maybe<Scalars['numeric']>;
  price_month_diff_percent?: Maybe<Scalars['numeric']>;
  price_week_diff_percent?: Maybe<Scalars['numeric']>;
  symbol?: Maybe<Scalars['String']>;
  token_day_trading_volume?: Maybe<Scalars['numeric']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['numeric']>;
};

/** order by min() on columns of table "flat.tokens" */
export type Flat_Tokens_Min_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  denom?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  symbol?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.tokens" */
export type Flat_Tokens_Order_By = {
  blockchain?: InputMaybe<Order_By>;
  blockchainByBlockchain?: InputMaybe<Flat_Blockchains_Order_By>;
  blockchains_aggregate?: InputMaybe<Flat_Blockchains_Aggregate_Order_By>;
  denom?: InputMaybe<Order_By>;
  logo_url?: InputMaybe<Order_By>;
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  symbol?: InputMaybe<Order_By>;
  token_charts_aggregate?: InputMaybe<Flat_Token_Charts_Aggregate_Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "flat.tokens" */
export type Flat_Tokens_Pk_Columns_Input = {
  blockchain: Scalars['String'];
  denom: Scalars['String'];
};

/** select columns of table "flat.tokens" */
export const enum Flat_Tokens_Select_Column {
  /** column name */
  Blockchain = 'blockchain',
  /** column name */
  Denom = 'denom',
  /** column name */
  LogoUrl = 'logo_url',
  /** column name */
  MarketCap = 'market_cap',
  /** column name */
  OnChainSupply = 'on_chain_supply',
  /** column name */
  Price = 'price',
  /** column name */
  PriceDayDiffPercent = 'price_day_diff_percent',
  /** column name */
  PriceMonthDiffPercent = 'price_month_diff_percent',
  /** column name */
  PriceWeekDiffPercent = 'price_week_diff_percent',
  /** column name */
  Symbol = 'symbol',
  /** column name */
  TokenDayTradingVolume = 'token_day_trading_volume',
  /** column name */
  TokenDayTradingVolumeDiffPercent = 'token_day_trading_volume_diff_percent',
}

/** aggregate stddev on columns */
export type Flat_Tokens_Stddev_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.tokens" */
export type Flat_Tokens_Stddev_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Tokens_Stddev_Pop_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.tokens" */
export type Flat_Tokens_Stddev_Pop_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Tokens_Stddev_Samp_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.tokens" */
export type Flat_Tokens_Stddev_Samp_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Tokens_Sum_Fields = {
  market_cap?: Maybe<Scalars['numeric']>;
  on_chain_supply?: Maybe<Scalars['numeric']>;
  price?: Maybe<Scalars['numeric']>;
  price_day_diff_percent?: Maybe<Scalars['numeric']>;
  price_month_diff_percent?: Maybe<Scalars['numeric']>;
  price_week_diff_percent?: Maybe<Scalars['numeric']>;
  token_day_trading_volume?: Maybe<Scalars['numeric']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "flat.tokens" */
export type Flat_Tokens_Sum_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Tokens_Var_Pop_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.tokens" */
export type Flat_Tokens_Var_Pop_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Tokens_Var_Samp_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.tokens" */
export type Flat_Tokens_Var_Samp_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Tokens_Variance_Fields = {
  market_cap?: Maybe<Scalars['Float']>;
  on_chain_supply?: Maybe<Scalars['Float']>;
  price?: Maybe<Scalars['Float']>;
  price_day_diff_percent?: Maybe<Scalars['Float']>;
  price_month_diff_percent?: Maybe<Scalars['Float']>;
  price_week_diff_percent?: Maybe<Scalars['Float']>;
  token_day_trading_volume?: Maybe<Scalars['Float']>;
  token_day_trading_volume_diff_percent?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.tokens" */
export type Flat_Tokens_Variance_Order_By = {
  market_cap?: InputMaybe<Order_By>;
  on_chain_supply?: InputMaybe<Order_By>;
  price?: InputMaybe<Order_By>;
  price_day_diff_percent?: InputMaybe<Order_By>;
  price_month_diff_percent?: InputMaybe<Order_By>;
  price_week_diff_percent?: InputMaybe<Order_By>;
  token_day_trading_volume?: InputMaybe<Order_By>;
  token_day_trading_volume_diff_percent?: InputMaybe<Order_By>;
};

/** columns and relationships of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type = {
  chart_type: Scalars['String'];
  /** An array relationship */
  total_tf_switched_charts: Array<Flat_Total_Tf_Switched_Charts>;
  /** An aggregated array relationship */
  total_tf_switched_charts_aggregate: Flat_Total_Tf_Switched_Charts_Aggregate;
};

/** columns and relationships of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_TypeTotal_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** columns and relationships of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_TypeTotal_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregated selection of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Aggregate = {
  aggregate?: Maybe<Flat_Total_Tf_Switched_Chart_Type_Aggregate_Fields>;
  nodes: Array<Flat_Total_Tf_Switched_Chart_Type>;
};

/** aggregate fields of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Aggregate_Fields = {
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Total_Tf_Switched_Chart_Type_Max_Fields>;
  min?: Maybe<Flat_Total_Tf_Switched_Chart_Type_Min_Fields>;
};

/** aggregate fields of "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Max_Order_By>;
  min?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Min_Order_By>;
};

/** Boolean expression to filter rows from the table "flat.total_tf_switched_chart_type". All fields are combined with a logical 'AND'. */
export type Flat_Total_Tf_Switched_Chart_Type_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>>>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  total_tf_switched_charts?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Total_Tf_Switched_Chart_Type_Max_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Max_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Total_Tf_Switched_Chart_Type_Min_Fields = {
  chart_type?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Min_Order_By = {
  chart_type?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Order_By = {
  chart_type?: InputMaybe<Order_By>;
  total_tf_switched_charts_aggregate?: InputMaybe<Flat_Total_Tf_Switched_Charts_Aggregate_Order_By>;
};

/** primary key columns input for table: "flat.total_tf_switched_chart_type" */
export type Flat_Total_Tf_Switched_Chart_Type_Pk_Columns_Input = {
  chart_type: Scalars['String'];
};

/** select columns of table "flat.total_tf_switched_chart_type" */
export const enum Flat_Total_Tf_Switched_Chart_Type_Select_Column {
  /** column name */
  ChartType = 'chart_type',
}

/** columns and relationships of "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts = {
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  point_value?: Maybe<Scalars['numeric']>;
  timeframe: Scalars['Int'];
  /** An object relationship */
  timeframeByTimeframe: Flat_Timeframes;
  /** An object relationship */
  total_tf_switched_chart_type: Flat_Total_Tf_Switched_Chart_Type;
};

/** aggregated selection of "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Aggregate = {
  aggregate?: Maybe<Flat_Total_Tf_Switched_Charts_Aggregate_Fields>;
  nodes: Array<Flat_Total_Tf_Switched_Charts>;
};

/** aggregate fields of "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Aggregate_Fields = {
  avg?: Maybe<Flat_Total_Tf_Switched_Charts_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Flat_Total_Tf_Switched_Charts_Max_Fields>;
  min?: Maybe<Flat_Total_Tf_Switched_Charts_Min_Fields>;
  stddev?: Maybe<Flat_Total_Tf_Switched_Charts_Stddev_Fields>;
  stddev_pop?: Maybe<Flat_Total_Tf_Switched_Charts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Flat_Total_Tf_Switched_Charts_Stddev_Samp_Fields>;
  sum?: Maybe<Flat_Total_Tf_Switched_Charts_Sum_Fields>;
  var_pop?: Maybe<Flat_Total_Tf_Switched_Charts_Var_Pop_Fields>;
  var_samp?: Maybe<Flat_Total_Tf_Switched_Charts_Var_Samp_Fields>;
  variance?: Maybe<Flat_Total_Tf_Switched_Charts_Variance_Fields>;
};

/** aggregate fields of "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Aggregate_Order_By = {
  avg?: InputMaybe<Flat_Total_Tf_Switched_Charts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Flat_Total_Tf_Switched_Charts_Max_Order_By>;
  min?: InputMaybe<Flat_Total_Tf_Switched_Charts_Min_Order_By>;
  stddev?: InputMaybe<Flat_Total_Tf_Switched_Charts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Flat_Total_Tf_Switched_Charts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Flat_Total_Tf_Switched_Charts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Flat_Total_Tf_Switched_Charts_Sum_Order_By>;
  var_pop?: InputMaybe<Flat_Total_Tf_Switched_Charts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Flat_Total_Tf_Switched_Charts_Var_Samp_Order_By>;
  variance?: InputMaybe<Flat_Total_Tf_Switched_Charts_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Flat_Total_Tf_Switched_Charts_Avg_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Avg_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "flat.total_tf_switched_charts". All fields are combined with a logical 'AND'. */
export type Flat_Total_Tf_Switched_Charts_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>>>;
  _not?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>>>;
  chart_type?: InputMaybe<String_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  point_index?: InputMaybe<Int_Comparison_Exp>;
  point_value?: InputMaybe<Numeric_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Bool_Exp>;
  total_tf_switched_chart_type?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** aggregate max on columns */
export type Flat_Total_Tf_Switched_Charts_Max_Fields = {
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Max_Order_By = {
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Flat_Total_Tf_Switched_Charts_Min_Fields = {
  chart_type?: Maybe<Scalars['String']>;
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Min_Order_By = {
  chart_type?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Order_By = {
  chart_type?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  timeframeByTimeframe?: InputMaybe<Flat_Timeframes_Order_By>;
  total_tf_switched_chart_type?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Order_By>;
};

/** primary key columns input for table: "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Pk_Columns_Input = {
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** select columns of table "flat.total_tf_switched_charts" */
export const enum Flat_Total_Tf_Switched_Charts_Select_Column {
  /** column name */
  ChartType = 'chart_type',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  PointIndex = 'point_index',
  /** column name */
  PointValue = 'point_value',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Flat_Total_Tf_Switched_Charts_Stddev_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Stddev_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Flat_Total_Tf_Switched_Charts_Stddev_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Stddev_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Flat_Total_Tf_Switched_Charts_Stddev_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Stddev_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Flat_Total_Tf_Switched_Charts_Sum_Fields = {
  point_index?: Maybe<Scalars['Int']>;
  point_value?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Sum_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Flat_Total_Tf_Switched_Charts_Var_Pop_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Var_Pop_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Flat_Total_Tf_Switched_Charts_Var_Samp_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Var_Samp_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Flat_Total_Tf_Switched_Charts_Variance_Fields = {
  point_index?: Maybe<Scalars['Float']>;
  point_value?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "flat.total_tf_switched_charts" */
export type Flat_Total_Tf_Switched_Charts_Variance_Order_By = {
  point_index?: InputMaybe<Order_By>;
  point_value?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats = {
  ibc_cashflow_in: Scalars['bigint'];
  ibc_cashflow_in_diff: Scalars['bigint'];
  ibc_cashflow_in_pending: Scalars['bigint'];
  ibc_cashflow_out: Scalars['bigint'];
  ibc_cashflow_out_diff: Scalars['bigint'];
  ibc_cashflow_out_pending: Scalars['bigint'];
  ibc_tx: Scalars['bigint'];
  ibc_tx_diff: Scalars['bigint'];
  ibc_tx_failed: Scalars['bigint'];
  ibc_tx_failed_diff: Scalars['bigint'];
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate: Scalars['numeric'];
  ibc_tx_success_rate_diff: Scalars['numeric'];
  is_zone_counterparty_mainnet: Scalars['Boolean'];
  is_zone_counterparty_up_to_date?: Maybe<Scalars['Boolean']>;
  is_zone_up_to_date?: Maybe<Scalars['Boolean']>;
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
  zone_counterparty: Scalars['String'];
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** aggregated selection of "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Aggregate = {
  aggregate?: Maybe<Ft_Channel_Group_Stats_Aggregate_Fields>;
  nodes: Array<Ft_Channel_Group_Stats>;
};

/** aggregate fields of "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Aggregate_Fields = {
  avg?: Maybe<Ft_Channel_Group_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Ft_Channel_Group_Stats_Max_Fields>;
  min?: Maybe<Ft_Channel_Group_Stats_Min_Fields>;
  stddev?: Maybe<Ft_Channel_Group_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Ft_Channel_Group_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Ft_Channel_Group_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Ft_Channel_Group_Stats_Sum_Fields>;
  var_pop?: Maybe<Ft_Channel_Group_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Ft_Channel_Group_Stats_Var_Samp_Fields>;
  variance?: Maybe<Ft_Channel_Group_Stats_Variance_Fields>;
};

/** aggregate fields of "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Ft_Channel_Group_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Ft_Channel_Group_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Ft_Channel_Group_Stats_Max_Order_By>;
  min?: InputMaybe<Ft_Channel_Group_Stats_Min_Order_By>;
  stddev?: InputMaybe<Ft_Channel_Group_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Ft_Channel_Group_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Ft_Channel_Group_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Ft_Channel_Group_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Ft_Channel_Group_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Ft_Channel_Group_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Ft_Channel_Group_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Ft_Channel_Group_Stats_Avg_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Avg_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "ft_channel_group_stats". All fields are combined with a logical 'AND'. */
export type Ft_Channel_Group_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>>>;
  ibc_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_failed?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_failed_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_pending?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_success_rate?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_success_rate_diff?: InputMaybe<Numeric_Comparison_Exp>;
  is_zone_counterparty_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_counterparty_up_to_date?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_up_to_date?: InputMaybe<Boolean_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_readable_name?: InputMaybe<String_Comparison_Exp>;
  zone_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_readable_name?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Ft_Channel_Group_Stats_Max_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counterparty?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Max_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Ft_Channel_Group_Stats_Min_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counterparty?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Min_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  is_zone_counterparty_mainnet?: InputMaybe<Order_By>;
  is_zone_counterparty_up_to_date?: InputMaybe<Order_By>;
  is_zone_up_to_date?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Pk_Columns_Input = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
  zone_counterparty: Scalars['String'];
};

/** select columns of table "ft_channel_group_stats" */
export const enum Ft_Channel_Group_Stats_Select_Column {
  /** column name */
  IbcCashflowIn = 'ibc_cashflow_in',
  /** column name */
  IbcCashflowInDiff = 'ibc_cashflow_in_diff',
  /** column name */
  IbcCashflowInPending = 'ibc_cashflow_in_pending',
  /** column name */
  IbcCashflowOut = 'ibc_cashflow_out',
  /** column name */
  IbcCashflowOutDiff = 'ibc_cashflow_out_diff',
  /** column name */
  IbcCashflowOutPending = 'ibc_cashflow_out_pending',
  /** column name */
  IbcTx = 'ibc_tx',
  /** column name */
  IbcTxDiff = 'ibc_tx_diff',
  /** column name */
  IbcTxFailed = 'ibc_tx_failed',
  /** column name */
  IbcTxFailedDiff = 'ibc_tx_failed_diff',
  /** column name */
  IbcTxPending = 'ibc_tx_pending',
  /** column name */
  IbcTxSuccessRate = 'ibc_tx_success_rate',
  /** column name */
  IbcTxSuccessRateDiff = 'ibc_tx_success_rate_diff',
  /** column name */
  IsZoneCounterpartyMainnet = 'is_zone_counterparty_mainnet',
  /** column name */
  IsZoneCounterpartyUpToDate = 'is_zone_counterparty_up_to_date',
  /** column name */
  IsZoneUpToDate = 'is_zone_up_to_date',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  Zone = 'zone',
  /** column name */
  ZoneCounterparty = 'zone_counterparty',
  /** column name */
  ZoneCounterpartyLabelUrl = 'zone_counterparty_label_url',
  /** column name */
  ZoneCounterpartyReadableName = 'zone_counterparty_readable_name',
  /** column name */
  ZoneLabelUrl = 'zone_label_url',
  /** column name */
  ZoneReadableName = 'zone_readable_name',
}

/** aggregate stddev on columns */
export type Ft_Channel_Group_Stats_Stddev_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Stddev_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Ft_Channel_Group_Stats_Stddev_Pop_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Stddev_Pop_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Ft_Channel_Group_Stats_Stddev_Samp_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Stddev_Samp_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Ft_Channel_Group_Stats_Sum_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Sum_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Ft_Channel_Group_Stats_Var_Pop_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Var_Pop_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Ft_Channel_Group_Stats_Var_Samp_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Var_Samp_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Ft_Channel_Group_Stats_Variance_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "ft_channel_group_stats" */
export type Ft_Channel_Group_Stats_Variance_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "ft_channels_stats" */
export type Ft_Channels_Stats = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  ibc_cashflow_in: Scalars['bigint'];
  ibc_cashflow_in_diff: Scalars['bigint'];
  ibc_cashflow_in_pending: Scalars['bigint'];
  ibc_cashflow_out: Scalars['bigint'];
  ibc_cashflow_out_diff: Scalars['bigint'];
  ibc_cashflow_out_pending: Scalars['bigint'];
  ibc_tx: Scalars['bigint'];
  ibc_tx_diff: Scalars['bigint'];
  ibc_tx_failed: Scalars['bigint'];
  ibc_tx_failed_diff: Scalars['bigint'];
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate: Scalars['numeric'];
  ibc_tx_success_rate_diff: Scalars['numeric'];
  is_opened: Scalars['Boolean'];
  is_zone_counterparty_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
  zone_counterparty: Scalars['String'];
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
  zone_website?: Maybe<Scalars['String']>;
};

/** aggregated selection of "ft_channels_stats" */
export type Ft_Channels_Stats_Aggregate = {
  aggregate?: Maybe<Ft_Channels_Stats_Aggregate_Fields>;
  nodes: Array<Ft_Channels_Stats>;
};

/** aggregate fields of "ft_channels_stats" */
export type Ft_Channels_Stats_Aggregate_Fields = {
  avg?: Maybe<Ft_Channels_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Ft_Channels_Stats_Max_Fields>;
  min?: Maybe<Ft_Channels_Stats_Min_Fields>;
  stddev?: Maybe<Ft_Channels_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Ft_Channels_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Ft_Channels_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Ft_Channels_Stats_Sum_Fields>;
  var_pop?: Maybe<Ft_Channels_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Ft_Channels_Stats_Var_Samp_Fields>;
  variance?: Maybe<Ft_Channels_Stats_Variance_Fields>;
};

/** aggregate fields of "ft_channels_stats" */
export type Ft_Channels_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Ft_Channels_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "ft_channels_stats" */
export type Ft_Channels_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Ft_Channels_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Ft_Channels_Stats_Max_Order_By>;
  min?: InputMaybe<Ft_Channels_Stats_Min_Order_By>;
  stddev?: InputMaybe<Ft_Channels_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Ft_Channels_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Ft_Channels_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Ft_Channels_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Ft_Channels_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Ft_Channels_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Ft_Channels_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Ft_Channels_Stats_Avg_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Avg_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "ft_channels_stats". All fields are combined with a logical 'AND'. */
export type Ft_Channels_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Ft_Channels_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Ft_Channels_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Ft_Channels_Stats_Bool_Exp>>>;
  channel_id?: InputMaybe<String_Comparison_Exp>;
  client_id?: InputMaybe<String_Comparison_Exp>;
  connection_id?: InputMaybe<String_Comparison_Exp>;
  ibc_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_failed?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_failed_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_tx_pending?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_success_rate?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_success_rate_diff?: InputMaybe<Numeric_Comparison_Exp>;
  is_opened?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_counterparty_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_channel_id?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_label_url2?: InputMaybe<String_Comparison_Exp>;
  zone_counterparty_readable_name?: InputMaybe<String_Comparison_Exp>;
  zone_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_label_url2?: InputMaybe<String_Comparison_Exp>;
  zone_readable_name?: InputMaybe<String_Comparison_Exp>;
  zone_website?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Ft_Channels_Stats_Max_Fields = {
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counterparty?: Maybe<Scalars['String']>;
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
  zone_website?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Max_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
  zone_website?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Ft_Channels_Stats_Min_Fields = {
  channel_id?: Maybe<Scalars['String']>;
  client_id?: Maybe<Scalars['String']>;
  connection_id?: Maybe<Scalars['String']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
  zone_counterparty?: Maybe<Scalars['String']>;
  zone_counterparty_channel_id?: Maybe<Scalars['String']>;
  zone_counterparty_label_url?: Maybe<Scalars['String']>;
  zone_counterparty_label_url2?: Maybe<Scalars['String']>;
  zone_counterparty_readable_name?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
  zone_website?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Min_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
  zone_website?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "ft_channels_stats" */
export type Ft_Channels_Stats_Order_By = {
  channel_id?: InputMaybe<Order_By>;
  client_id?: InputMaybe<Order_By>;
  connection_id?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  is_opened?: InputMaybe<Order_By>;
  is_zone_counterparty_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_counterparty?: InputMaybe<Order_By>;
  zone_counterparty_channel_id?: InputMaybe<Order_By>;
  zone_counterparty_label_url?: InputMaybe<Order_By>;
  zone_counterparty_label_url2?: InputMaybe<Order_By>;
  zone_counterparty_readable_name?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
  zone_website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "ft_channels_stats" */
export type Ft_Channels_Stats_Pk_Columns_Input = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** select columns of table "ft_channels_stats" */
export const enum Ft_Channels_Stats_Select_Column {
  /** column name */
  ChannelId = 'channel_id',
  /** column name */
  ClientId = 'client_id',
  /** column name */
  ConnectionId = 'connection_id',
  /** column name */
  IbcCashflowIn = 'ibc_cashflow_in',
  /** column name */
  IbcCashflowInDiff = 'ibc_cashflow_in_diff',
  /** column name */
  IbcCashflowInPending = 'ibc_cashflow_in_pending',
  /** column name */
  IbcCashflowOut = 'ibc_cashflow_out',
  /** column name */
  IbcCashflowOutDiff = 'ibc_cashflow_out_diff',
  /** column name */
  IbcCashflowOutPending = 'ibc_cashflow_out_pending',
  /** column name */
  IbcTx = 'ibc_tx',
  /** column name */
  IbcTxDiff = 'ibc_tx_diff',
  /** column name */
  IbcTxFailed = 'ibc_tx_failed',
  /** column name */
  IbcTxFailedDiff = 'ibc_tx_failed_diff',
  /** column name */
  IbcTxPending = 'ibc_tx_pending',
  /** column name */
  IbcTxSuccessRate = 'ibc_tx_success_rate',
  /** column name */
  IbcTxSuccessRateDiff = 'ibc_tx_success_rate_diff',
  /** column name */
  IsOpened = 'is_opened',
  /** column name */
  IsZoneCounterpartyMainnet = 'is_zone_counterparty_mainnet',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  Zone = 'zone',
  /** column name */
  ZoneCounterparty = 'zone_counterparty',
  /** column name */
  ZoneCounterpartyChannelId = 'zone_counterparty_channel_id',
  /** column name */
  ZoneCounterpartyLabelUrl = 'zone_counterparty_label_url',
  /** column name */
  ZoneCounterpartyLabelUrl2 = 'zone_counterparty_label_url2',
  /** column name */
  ZoneCounterpartyReadableName = 'zone_counterparty_readable_name',
  /** column name */
  ZoneLabelUrl = 'zone_label_url',
  /** column name */
  ZoneLabelUrl2 = 'zone_label_url2',
  /** column name */
  ZoneReadableName = 'zone_readable_name',
  /** column name */
  ZoneWebsite = 'zone_website',
}

/** aggregate stddev on columns */
export type Ft_Channels_Stats_Stddev_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Stddev_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Ft_Channels_Stats_Stddev_Pop_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Stddev_Pop_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Ft_Channels_Stats_Stddev_Samp_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Stddev_Samp_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Ft_Channels_Stats_Sum_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_tx?: Maybe<Scalars['bigint']>;
  ibc_tx_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_failed?: Maybe<Scalars['bigint']>;
  ibc_tx_failed_diff?: Maybe<Scalars['bigint']>;
  ibc_tx_pending?: Maybe<Scalars['Int']>;
  ibc_tx_success_rate?: Maybe<Scalars['numeric']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Sum_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Ft_Channels_Stats_Var_Pop_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Var_Pop_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Ft_Channels_Stats_Var_Samp_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Var_Samp_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Ft_Channels_Stats_Variance_Fields = {
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_tx?: Maybe<Scalars['Float']>;
  ibc_tx_diff?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_pending?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate?: Maybe<Scalars['Float']>;
  ibc_tx_success_rate_diff?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "ft_channels_stats" */
export type Ft_Channels_Stats_Variance_Order_By = {
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_tx?: InputMaybe<Order_By>;
  ibc_tx_diff?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_pending?: InputMaybe<Order_By>;
  ibc_tx_success_rate?: InputMaybe<Order_By>;
  ibc_tx_success_rate_diff?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "headers" */
export type Headers = {
  channels_cnt_active_period: Scalars['Int'];
  channels_cnt_active_period_diff: Scalars['Int'];
  channels_cnt_all: Scalars['Int'];
  channels_cnt_open: Scalars['Int'];
  channels_cnt_period: Scalars['Int'];
  channels_percent_active_period: Scalars['Int'];
  channels_percent_active_period_diff: Scalars['Int'];
  chart: Scalars['jsonb'];
  chart_cashflow?: Maybe<Scalars['jsonb']>;
  chart_transfers?: Maybe<Scalars['jsonb']>;
  ibc_cashflow_pending_period: Scalars['bigint'];
  ibc_cashflow_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['bigint']>;
  ibc_transfers_failed_period: Scalars['Int'];
  ibc_transfers_pending_period: Scalars['Int'];
  ibc_transfers_period: Scalars['Int'];
  ibc_transfers_period_diff: Scalars['Int'];
  is_mainnet_only: Scalars['Boolean'];
  relations_cnt_open: Scalars['Int'];
  timeframe: Scalars['Int'];
  top_ibc_cashflow_zone_pair?: Maybe<Scalars['jsonb']>;
  top_transfer_zone_pair?: Maybe<Scalars['jsonb']>;
  top_zone_pair: Scalars['jsonb'];
  zones_cnt_all: Scalars['Int'];
  zones_cnt_period: Scalars['Int'];
};

/** columns and relationships of "headers" */
export type HeadersChartArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "headers" */
export type HeadersChart_CashflowArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "headers" */
export type HeadersChart_TransfersArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "headers" */
export type HeadersTop_Ibc_Cashflow_Zone_PairArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "headers" */
export type HeadersTop_Transfer_Zone_PairArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "headers" */
export type HeadersTop_Zone_PairArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "headers" */
export type Headers_Aggregate = {
  aggregate?: Maybe<Headers_Aggregate_Fields>;
  nodes: Array<Headers>;
};

/** aggregate fields of "headers" */
export type Headers_Aggregate_Fields = {
  avg?: Maybe<Headers_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Headers_Max_Fields>;
  min?: Maybe<Headers_Min_Fields>;
  stddev?: Maybe<Headers_Stddev_Fields>;
  stddev_pop?: Maybe<Headers_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Headers_Stddev_Samp_Fields>;
  sum?: Maybe<Headers_Sum_Fields>;
  var_pop?: Maybe<Headers_Var_Pop_Fields>;
  var_samp?: Maybe<Headers_Var_Samp_Fields>;
  variance?: Maybe<Headers_Variance_Fields>;
};

/** aggregate fields of "headers" */
export type Headers_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Headers_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "headers" */
export type Headers_Aggregate_Order_By = {
  avg?: InputMaybe<Headers_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Headers_Max_Order_By>;
  min?: InputMaybe<Headers_Min_Order_By>;
  stddev?: InputMaybe<Headers_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Headers_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Headers_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Headers_Sum_Order_By>;
  var_pop?: InputMaybe<Headers_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Headers_Var_Samp_Order_By>;
  variance?: InputMaybe<Headers_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Headers_Avg_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "headers" */
export type Headers_Avg_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "headers". All fields are combined with a logical 'AND'. */
export type Headers_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Headers_Bool_Exp>>>;
  _not?: InputMaybe<Headers_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Headers_Bool_Exp>>>;
  channels_cnt_active_period?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_active_period_diff?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_all?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_open?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_period?: InputMaybe<Int_Comparison_Exp>;
  channels_percent_active_period?: InputMaybe<Int_Comparison_Exp>;
  channels_percent_active_period_diff?: InputMaybe<Int_Comparison_Exp>;
  chart?: InputMaybe<Jsonb_Comparison_Exp>;
  chart_cashflow?: InputMaybe<Jsonb_Comparison_Exp>;
  chart_transfers?: InputMaybe<Jsonb_Comparison_Exp>;
  ibc_cashflow_pending_period?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_period?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_period_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_transfers_failed_period?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending_period?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_period?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_period_diff?: InputMaybe<Int_Comparison_Exp>;
  is_mainnet_only?: InputMaybe<Boolean_Comparison_Exp>;
  relations_cnt_open?: InputMaybe<Int_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  top_ibc_cashflow_zone_pair?: InputMaybe<Jsonb_Comparison_Exp>;
  top_transfer_zone_pair?: InputMaybe<Jsonb_Comparison_Exp>;
  top_zone_pair?: InputMaybe<Jsonb_Comparison_Exp>;
  zones_cnt_all?: InputMaybe<Int_Comparison_Exp>;
  zones_cnt_period?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Headers_Max_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_all?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_cnt_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['bigint']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Int']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  zones_cnt_all?: Maybe<Scalars['Int']>;
  zones_cnt_period?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "headers" */
export type Headers_Max_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Headers_Min_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_all?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_cnt_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['bigint']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Int']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  zones_cnt_all?: Maybe<Scalars['Int']>;
  zones_cnt_period?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "headers" */
export type Headers_Min_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "headers" */
export type Headers_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  chart?: InputMaybe<Order_By>;
  chart_cashflow?: InputMaybe<Order_By>;
  chart_transfers?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  is_mainnet_only?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  top_ibc_cashflow_zone_pair?: InputMaybe<Order_By>;
  top_transfer_zone_pair?: InputMaybe<Order_By>;
  top_zone_pair?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "headers" */
export type Headers_Pk_Columns_Input = {
  is_mainnet_only: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** select columns of table "headers" */
export const enum Headers_Select_Column {
  /** column name */
  ChannelsCntActivePeriod = 'channels_cnt_active_period',
  /** column name */
  ChannelsCntActivePeriodDiff = 'channels_cnt_active_period_diff',
  /** column name */
  ChannelsCntAll = 'channels_cnt_all',
  /** column name */
  ChannelsCntOpen = 'channels_cnt_open',
  /** column name */
  ChannelsCntPeriod = 'channels_cnt_period',
  /** column name */
  ChannelsPercentActivePeriod = 'channels_percent_active_period',
  /** column name */
  ChannelsPercentActivePeriodDiff = 'channels_percent_active_period_diff',
  /** column name */
  Chart = 'chart',
  /** column name */
  ChartCashflow = 'chart_cashflow',
  /** column name */
  ChartTransfers = 'chart_transfers',
  /** column name */
  IbcCashflowPendingPeriod = 'ibc_cashflow_pending_period',
  /** column name */
  IbcCashflowPeriod = 'ibc_cashflow_period',
  /** column name */
  IbcCashflowPeriodDiff = 'ibc_cashflow_period_diff',
  /** column name */
  IbcTransfersFailedPeriod = 'ibc_transfers_failed_period',
  /** column name */
  IbcTransfersPendingPeriod = 'ibc_transfers_pending_period',
  /** column name */
  IbcTransfersPeriod = 'ibc_transfers_period',
  /** column name */
  IbcTransfersPeriodDiff = 'ibc_transfers_period_diff',
  /** column name */
  IsMainnetOnly = 'is_mainnet_only',
  /** column name */
  RelationsCntOpen = 'relations_cnt_open',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  TopIbcCashflowZonePair = 'top_ibc_cashflow_zone_pair',
  /** column name */
  TopTransferZonePair = 'top_transfer_zone_pair',
  /** column name */
  TopZonePair = 'top_zone_pair',
  /** column name */
  ZonesCntAll = 'zones_cnt_all',
  /** column name */
  ZonesCntPeriod = 'zones_cnt_period',
}

/** aggregate stddev on columns */
export type Headers_Stddev_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "headers" */
export type Headers_Stddev_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Headers_Stddev_Pop_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "headers" */
export type Headers_Stddev_Pop_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Headers_Stddev_Samp_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "headers" */
export type Headers_Stddev_Samp_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Headers_Sum_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_all?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_cnt_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period?: Maybe<Scalars['bigint']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['bigint']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period?: Maybe<Scalars['Int']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Int']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  timeframe?: Maybe<Scalars['Int']>;
  zones_cnt_all?: Maybe<Scalars['Int']>;
  zones_cnt_period?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "headers" */
export type Headers_Sum_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Headers_Var_Pop_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "headers" */
export type Headers_Var_Pop_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Headers_Var_Samp_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "headers" */
export type Headers_Var_Samp_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Headers_Variance_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_all?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_cnt_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period?: Maybe<Scalars['Float']>;
  ibc_cashflow_period_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_failed_period?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period?: Maybe<Scalars['Float']>;
  ibc_transfers_period_diff?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  zones_cnt_all?: Maybe<Scalars['Float']>;
  zones_cnt_period?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "headers" */
export type Headers_Variance_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_all?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_cnt_period?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_cashflow_pending_period?: InputMaybe<Order_By>;
  ibc_cashflow_period?: InputMaybe<Order_By>;
  ibc_cashflow_period_diff?: InputMaybe<Order_By>;
  ibc_transfers_failed_period?: InputMaybe<Order_By>;
  ibc_transfers_pending_period?: InputMaybe<Order_By>;
  ibc_transfers_period?: InputMaybe<Order_By>;
  ibc_transfers_period_diff?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  zones_cnt_all?: InputMaybe<Order_By>;
  zones_cnt_period?: InputMaybe<Order_By>;
};

/** expression to compare columns of type jsonb. All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']>;
  _eq?: InputMaybe<Scalars['jsonb']>;
  _gt?: InputMaybe<Scalars['jsonb']>;
  _gte?: InputMaybe<Scalars['jsonb']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['jsonb']>;
  _lte?: InputMaybe<Scalars['jsonb']>;
  _neq?: InputMaybe<Scalars['jsonb']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']>>;
};

/** columns and relationships of "nodes_addrs" */
export type Nodes_Addrs = {
  city?: Maybe<Scalars['String']>;
  continent?: Maybe<Scalars['String']>;
  continent_code?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  country_code?: Maybe<Scalars['String']>;
  district?: Maybe<Scalars['String']>;
  ip_or_dns: Scalars['String'];
  is_hidden: Scalars['Boolean'];
  is_hosting?: Maybe<Scalars['Boolean']>;
  is_prioritized: Scalars['Boolean'];
  isp_name?: Maybe<Scalars['String']>;
  last_checked_at: Scalars['timestamp'];
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  org?: Maybe<Scalars['String']>;
  org_as?: Maybe<Scalars['String']>;
  org_as_name?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  region_name?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  timezone_offset?: Maybe<Scalars['Int']>;
  zip?: Maybe<Scalars['String']>;
};

/** aggregated selection of "nodes_addrs" */
export type Nodes_Addrs_Aggregate = {
  aggregate?: Maybe<Nodes_Addrs_Aggregate_Fields>;
  nodes: Array<Nodes_Addrs>;
};

/** aggregate fields of "nodes_addrs" */
export type Nodes_Addrs_Aggregate_Fields = {
  avg?: Maybe<Nodes_Addrs_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Nodes_Addrs_Max_Fields>;
  min?: Maybe<Nodes_Addrs_Min_Fields>;
  stddev?: Maybe<Nodes_Addrs_Stddev_Fields>;
  stddev_pop?: Maybe<Nodes_Addrs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Nodes_Addrs_Stddev_Samp_Fields>;
  sum?: Maybe<Nodes_Addrs_Sum_Fields>;
  var_pop?: Maybe<Nodes_Addrs_Var_Pop_Fields>;
  var_samp?: Maybe<Nodes_Addrs_Var_Samp_Fields>;
  variance?: Maybe<Nodes_Addrs_Variance_Fields>;
};

/** aggregate fields of "nodes_addrs" */
export type Nodes_Addrs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Nodes_Addrs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "nodes_addrs" */
export type Nodes_Addrs_Aggregate_Order_By = {
  avg?: InputMaybe<Nodes_Addrs_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Nodes_Addrs_Max_Order_By>;
  min?: InputMaybe<Nodes_Addrs_Min_Order_By>;
  stddev?: InputMaybe<Nodes_Addrs_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Nodes_Addrs_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Nodes_Addrs_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Nodes_Addrs_Sum_Order_By>;
  var_pop?: InputMaybe<Nodes_Addrs_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Nodes_Addrs_Var_Samp_Order_By>;
  variance?: InputMaybe<Nodes_Addrs_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Nodes_Addrs_Avg_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Avg_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "nodes_addrs". All fields are combined with a logical 'AND'. */
export type Nodes_Addrs_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Nodes_Addrs_Bool_Exp>>>;
  _not?: InputMaybe<Nodes_Addrs_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Nodes_Addrs_Bool_Exp>>>;
  city?: InputMaybe<String_Comparison_Exp>;
  continent?: InputMaybe<String_Comparison_Exp>;
  continent_code?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  country_code?: InputMaybe<String_Comparison_Exp>;
  district?: InputMaybe<String_Comparison_Exp>;
  ip_or_dns?: InputMaybe<String_Comparison_Exp>;
  is_hidden?: InputMaybe<Boolean_Comparison_Exp>;
  is_hosting?: InputMaybe<Boolean_Comparison_Exp>;
  is_prioritized?: InputMaybe<Boolean_Comparison_Exp>;
  isp_name?: InputMaybe<String_Comparison_Exp>;
  last_checked_at?: InputMaybe<Timestamp_Comparison_Exp>;
  lat?: InputMaybe<Float_Comparison_Exp>;
  lon?: InputMaybe<Float_Comparison_Exp>;
  org?: InputMaybe<String_Comparison_Exp>;
  org_as?: InputMaybe<String_Comparison_Exp>;
  org_as_name?: InputMaybe<String_Comparison_Exp>;
  region?: InputMaybe<String_Comparison_Exp>;
  region_name?: InputMaybe<String_Comparison_Exp>;
  timezone?: InputMaybe<String_Comparison_Exp>;
  timezone_offset?: InputMaybe<Int_Comparison_Exp>;
  zip?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Nodes_Addrs_Max_Fields = {
  city?: Maybe<Scalars['String']>;
  continent?: Maybe<Scalars['String']>;
  continent_code?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  country_code?: Maybe<Scalars['String']>;
  district?: Maybe<Scalars['String']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  isp_name?: Maybe<Scalars['String']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  org?: Maybe<Scalars['String']>;
  org_as?: Maybe<Scalars['String']>;
  org_as_name?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  region_name?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  timezone_offset?: Maybe<Scalars['Int']>;
  zip?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Max_Order_By = {
  city?: InputMaybe<Order_By>;
  continent?: InputMaybe<Order_By>;
  continent_code?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  country_code?: InputMaybe<Order_By>;
  district?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  isp_name?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  org?: InputMaybe<Order_By>;
  org_as?: InputMaybe<Order_By>;
  org_as_name?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  region_name?: InputMaybe<Order_By>;
  timezone?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
  zip?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Nodes_Addrs_Min_Fields = {
  city?: Maybe<Scalars['String']>;
  continent?: Maybe<Scalars['String']>;
  continent_code?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  country_code?: Maybe<Scalars['String']>;
  district?: Maybe<Scalars['String']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  isp_name?: Maybe<Scalars['String']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  org?: Maybe<Scalars['String']>;
  org_as?: Maybe<Scalars['String']>;
  org_as_name?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  region_name?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  timezone_offset?: Maybe<Scalars['Int']>;
  zip?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Min_Order_By = {
  city?: InputMaybe<Order_By>;
  continent?: InputMaybe<Order_By>;
  continent_code?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  country_code?: InputMaybe<Order_By>;
  district?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  isp_name?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  org?: InputMaybe<Order_By>;
  org_as?: InputMaybe<Order_By>;
  org_as_name?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  region_name?: InputMaybe<Order_By>;
  timezone?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
  zip?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "nodes_addrs" */
export type Nodes_Addrs_Order_By = {
  city?: InputMaybe<Order_By>;
  continent?: InputMaybe<Order_By>;
  continent_code?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  country_code?: InputMaybe<Order_By>;
  district?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  is_hidden?: InputMaybe<Order_By>;
  is_hosting?: InputMaybe<Order_By>;
  is_prioritized?: InputMaybe<Order_By>;
  isp_name?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  org?: InputMaybe<Order_By>;
  org_as?: InputMaybe<Order_By>;
  org_as_name?: InputMaybe<Order_By>;
  region?: InputMaybe<Order_By>;
  region_name?: InputMaybe<Order_By>;
  timezone?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
  zip?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "nodes_addrs" */
export type Nodes_Addrs_Pk_Columns_Input = {
  ip_or_dns: Scalars['String'];
};

/** select columns of table "nodes_addrs" */
export const enum Nodes_Addrs_Select_Column {
  /** column name */
  City = 'city',
  /** column name */
  Continent = 'continent',
  /** column name */
  ContinentCode = 'continent_code',
  /** column name */
  Country = 'country',
  /** column name */
  CountryCode = 'country_code',
  /** column name */
  District = 'district',
  /** column name */
  IpOrDns = 'ip_or_dns',
  /** column name */
  IsHidden = 'is_hidden',
  /** column name */
  IsHosting = 'is_hosting',
  /** column name */
  IsPrioritized = 'is_prioritized',
  /** column name */
  IspName = 'isp_name',
  /** column name */
  LastCheckedAt = 'last_checked_at',
  /** column name */
  Lat = 'lat',
  /** column name */
  Lon = 'lon',
  /** column name */
  Org = 'org',
  /** column name */
  OrgAs = 'org_as',
  /** column name */
  OrgAsName = 'org_as_name',
  /** column name */
  Region = 'region',
  /** column name */
  RegionName = 'region_name',
  /** column name */
  Timezone = 'timezone',
  /** column name */
  TimezoneOffset = 'timezone_offset',
  /** column name */
  Zip = 'zip',
}

/** aggregate stddev on columns */
export type Nodes_Addrs_Stddev_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Stddev_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Nodes_Addrs_Stddev_Pop_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Stddev_Pop_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Nodes_Addrs_Stddev_Samp_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Stddev_Samp_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Nodes_Addrs_Sum_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Sum_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Nodes_Addrs_Var_Pop_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Var_Pop_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Nodes_Addrs_Var_Samp_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Var_Samp_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Nodes_Addrs_Variance_Fields = {
  lat?: Maybe<Scalars['Float']>;
  lon?: Maybe<Scalars['Float']>;
  timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "nodes_addrs" */
export type Nodes_Addrs_Variance_Order_By = {
  lat?: InputMaybe<Order_By>;
  lon?: InputMaybe<Order_By>;
  timezone_offset?: InputMaybe<Order_By>;
};

/** columns and relationships of "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs = {
  added_at: Scalars['timestamp'];
  ip_or_dns: Scalars['String'];
  is_alive: Scalars['Boolean'];
  is_hidden: Scalars['Boolean'];
  is_prioritized: Scalars['Boolean'];
  last_active?: Maybe<Scalars['timestamp']>;
  last_checked_at: Scalars['timestamp'];
  lcd_addr: Scalars['String'];
  response_time?: Maybe<Scalars['Int']>;
  zone: Scalars['String'];
};

/** aggregated selection of "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Aggregate = {
  aggregate?: Maybe<Nodes_Lcd_Addrs_Aggregate_Fields>;
  nodes: Array<Nodes_Lcd_Addrs>;
};

/** aggregate fields of "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Aggregate_Fields = {
  avg?: Maybe<Nodes_Lcd_Addrs_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Nodes_Lcd_Addrs_Max_Fields>;
  min?: Maybe<Nodes_Lcd_Addrs_Min_Fields>;
  stddev?: Maybe<Nodes_Lcd_Addrs_Stddev_Fields>;
  stddev_pop?: Maybe<Nodes_Lcd_Addrs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Nodes_Lcd_Addrs_Stddev_Samp_Fields>;
  sum?: Maybe<Nodes_Lcd_Addrs_Sum_Fields>;
  var_pop?: Maybe<Nodes_Lcd_Addrs_Var_Pop_Fields>;
  var_samp?: Maybe<Nodes_Lcd_Addrs_Var_Samp_Fields>;
  variance?: Maybe<Nodes_Lcd_Addrs_Variance_Fields>;
};

/** aggregate fields of "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Nodes_Lcd_Addrs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Aggregate_Order_By = {
  avg?: InputMaybe<Nodes_Lcd_Addrs_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Nodes_Lcd_Addrs_Max_Order_By>;
  min?: InputMaybe<Nodes_Lcd_Addrs_Min_Order_By>;
  stddev?: InputMaybe<Nodes_Lcd_Addrs_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Nodes_Lcd_Addrs_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Nodes_Lcd_Addrs_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Nodes_Lcd_Addrs_Sum_Order_By>;
  var_pop?: InputMaybe<Nodes_Lcd_Addrs_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Nodes_Lcd_Addrs_Var_Samp_Order_By>;
  variance?: InputMaybe<Nodes_Lcd_Addrs_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Nodes_Lcd_Addrs_Avg_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Avg_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "nodes_lcd_addrs". All fields are combined with a logical 'AND'. */
export type Nodes_Lcd_Addrs_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>>>;
  _not?: InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>>>;
  added_at?: InputMaybe<Timestamp_Comparison_Exp>;
  ip_or_dns?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_hidden?: InputMaybe<Boolean_Comparison_Exp>;
  is_prioritized?: InputMaybe<Boolean_Comparison_Exp>;
  last_active?: InputMaybe<Timestamp_Comparison_Exp>;
  last_checked_at?: InputMaybe<Timestamp_Comparison_Exp>;
  lcd_addr?: InputMaybe<String_Comparison_Exp>;
  response_time?: InputMaybe<Int_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Nodes_Lcd_Addrs_Max_Fields = {
  added_at?: Maybe<Scalars['timestamp']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  last_active?: Maybe<Scalars['timestamp']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  lcd_addr?: Maybe<Scalars['String']>;
  response_time?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Max_Order_By = {
  added_at?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Nodes_Lcd_Addrs_Min_Fields = {
  added_at?: Maybe<Scalars['timestamp']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  last_active?: Maybe<Scalars['timestamp']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  lcd_addr?: Maybe<Scalars['String']>;
  response_time?: Maybe<Scalars['Int']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Min_Order_By = {
  added_at?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Order_By = {
  added_at?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_hidden?: InputMaybe<Order_By>;
  is_prioritized?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Pk_Columns_Input = {
  lcd_addr: Scalars['String'];
};

/** select columns of table "nodes_lcd_addrs" */
export const enum Nodes_Lcd_Addrs_Select_Column {
  /** column name */
  AddedAt = 'added_at',
  /** column name */
  IpOrDns = 'ip_or_dns',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsHidden = 'is_hidden',
  /** column name */
  IsPrioritized = 'is_prioritized',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  LastCheckedAt = 'last_checked_at',
  /** column name */
  LcdAddr = 'lcd_addr',
  /** column name */
  ResponseTime = 'response_time',
  /** column name */
  Zone = 'zone',
}

/** aggregate stddev on columns */
export type Nodes_Lcd_Addrs_Stddev_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Stddev_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Nodes_Lcd_Addrs_Stddev_Pop_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Stddev_Pop_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Nodes_Lcd_Addrs_Stddev_Samp_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Stddev_Samp_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Nodes_Lcd_Addrs_Sum_Fields = {
  response_time?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Sum_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Nodes_Lcd_Addrs_Var_Pop_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Var_Pop_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Nodes_Lcd_Addrs_Var_Samp_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Var_Samp_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Nodes_Lcd_Addrs_Variance_Fields = {
  response_time?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "nodes_lcd_addrs" */
export type Nodes_Lcd_Addrs_Variance_Order_By = {
  response_time?: InputMaybe<Order_By>;
};

/** columns and relationships of "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs = {
  added_at: Scalars['timestamp'];
  earliest_block_height?: Maybe<Scalars['bigint']>;
  ip_or_dns: Scalars['String'];
  is_alive: Scalars['Boolean'];
  is_hidden: Scalars['Boolean'];
  is_prioritized: Scalars['Boolean'];
  last_active?: Maybe<Scalars['timestamp']>;
  last_block_height?: Maybe<Scalars['bigint']>;
  last_checked_at: Scalars['timestamp'];
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  response_time?: Maybe<Scalars['Int']>;
  rpc_addr: Scalars['String'];
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone: Scalars['String'];
};

/** aggregated selection of "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Aggregate = {
  aggregate?: Maybe<Nodes_Rpc_Addrs_Aggregate_Fields>;
  nodes: Array<Nodes_Rpc_Addrs>;
};

/** aggregate fields of "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Aggregate_Fields = {
  avg?: Maybe<Nodes_Rpc_Addrs_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Nodes_Rpc_Addrs_Max_Fields>;
  min?: Maybe<Nodes_Rpc_Addrs_Min_Fields>;
  stddev?: Maybe<Nodes_Rpc_Addrs_Stddev_Fields>;
  stddev_pop?: Maybe<Nodes_Rpc_Addrs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Nodes_Rpc_Addrs_Stddev_Samp_Fields>;
  sum?: Maybe<Nodes_Rpc_Addrs_Sum_Fields>;
  var_pop?: Maybe<Nodes_Rpc_Addrs_Var_Pop_Fields>;
  var_samp?: Maybe<Nodes_Rpc_Addrs_Var_Samp_Fields>;
  variance?: Maybe<Nodes_Rpc_Addrs_Variance_Fields>;
};

/** aggregate fields of "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Nodes_Rpc_Addrs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Aggregate_Order_By = {
  avg?: InputMaybe<Nodes_Rpc_Addrs_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Nodes_Rpc_Addrs_Max_Order_By>;
  min?: InputMaybe<Nodes_Rpc_Addrs_Min_Order_By>;
  stddev?: InputMaybe<Nodes_Rpc_Addrs_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Nodes_Rpc_Addrs_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Nodes_Rpc_Addrs_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Nodes_Rpc_Addrs_Sum_Order_By>;
  var_pop?: InputMaybe<Nodes_Rpc_Addrs_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Nodes_Rpc_Addrs_Var_Samp_Order_By>;
  variance?: InputMaybe<Nodes_Rpc_Addrs_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Nodes_Rpc_Addrs_Avg_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Avg_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "nodes_rpc_addrs". All fields are combined with a logical 'AND'. */
export type Nodes_Rpc_Addrs_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>>>;
  _not?: InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>>>;
  added_at?: InputMaybe<Timestamp_Comparison_Exp>;
  earliest_block_height?: InputMaybe<Bigint_Comparison_Exp>;
  ip_or_dns?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_hidden?: InputMaybe<Boolean_Comparison_Exp>;
  is_prioritized?: InputMaybe<Boolean_Comparison_Exp>;
  last_active?: InputMaybe<Timestamp_Comparison_Exp>;
  last_block_height?: InputMaybe<Bigint_Comparison_Exp>;
  last_checked_at?: InputMaybe<Timestamp_Comparison_Exp>;
  moniker?: InputMaybe<String_Comparison_Exp>;
  node_id?: InputMaybe<String_Comparison_Exp>;
  response_time?: InputMaybe<Int_Comparison_Exp>;
  rpc_addr?: InputMaybe<String_Comparison_Exp>;
  tx_index?: InputMaybe<String_Comparison_Exp>;
  version?: InputMaybe<String_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Nodes_Rpc_Addrs_Max_Fields = {
  added_at?: Maybe<Scalars['timestamp']>;
  earliest_block_height?: Maybe<Scalars['bigint']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  last_active?: Maybe<Scalars['timestamp']>;
  last_block_height?: Maybe<Scalars['bigint']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  response_time?: Maybe<Scalars['Int']>;
  rpc_addr?: Maybe<Scalars['String']>;
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Max_Order_By = {
  added_at?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Nodes_Rpc_Addrs_Min_Fields = {
  added_at?: Maybe<Scalars['timestamp']>;
  earliest_block_height?: Maybe<Scalars['bigint']>;
  ip_or_dns?: Maybe<Scalars['String']>;
  last_active?: Maybe<Scalars['timestamp']>;
  last_block_height?: Maybe<Scalars['bigint']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  response_time?: Maybe<Scalars['Int']>;
  rpc_addr?: Maybe<Scalars['String']>;
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Min_Order_By = {
  added_at?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Order_By = {
  added_at?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip_or_dns?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_hidden?: InputMaybe<Order_By>;
  is_prioritized?: InputMaybe<Order_By>;
  last_active?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Pk_Columns_Input = {
  rpc_addr: Scalars['String'];
};

/** select columns of table "nodes_rpc_addrs" */
export const enum Nodes_Rpc_Addrs_Select_Column {
  /** column name */
  AddedAt = 'added_at',
  /** column name */
  EarliestBlockHeight = 'earliest_block_height',
  /** column name */
  IpOrDns = 'ip_or_dns',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsHidden = 'is_hidden',
  /** column name */
  IsPrioritized = 'is_prioritized',
  /** column name */
  LastActive = 'last_active',
  /** column name */
  LastBlockHeight = 'last_block_height',
  /** column name */
  LastCheckedAt = 'last_checked_at',
  /** column name */
  Moniker = 'moniker',
  /** column name */
  NodeId = 'node_id',
  /** column name */
  ResponseTime = 'response_time',
  /** column name */
  RpcAddr = 'rpc_addr',
  /** column name */
  TxIndex = 'tx_index',
  /** column name */
  Version = 'version',
  /** column name */
  Zone = 'zone',
}

/** aggregate stddev on columns */
export type Nodes_Rpc_Addrs_Stddev_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Stddev_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Nodes_Rpc_Addrs_Stddev_Pop_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Stddev_Pop_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Nodes_Rpc_Addrs_Stddev_Samp_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Stddev_Samp_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Nodes_Rpc_Addrs_Sum_Fields = {
  earliest_block_height?: Maybe<Scalars['bigint']>;
  last_block_height?: Maybe<Scalars['bigint']>;
  response_time?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Sum_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Nodes_Rpc_Addrs_Var_Pop_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Var_Pop_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Nodes_Rpc_Addrs_Var_Samp_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Var_Samp_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Nodes_Rpc_Addrs_Variance_Fields = {
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  response_time?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "nodes_rpc_addrs" */
export type Nodes_Rpc_Addrs_Variance_Order_By = {
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  response_time?: InputMaybe<Order_By>;
};

/** expression to compare columns of type numeric. All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']>;
  _gt?: InputMaybe<Scalars['numeric']>;
  _gte?: InputMaybe<Scalars['numeric']>;
  _in?: InputMaybe<Array<Scalars['numeric']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['numeric']>;
  _lte?: InputMaybe<Scalars['numeric']>;
  _neq?: InputMaybe<Scalars['numeric']>;
  _nin?: InputMaybe<Array<Scalars['numeric']>>;
};

/** column ordering options */
export const enum Order_By {
  /** in the ascending order, nulls last */
  Asc = 'asc',
  /** in the ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in the ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in the descending order, nulls first */
  Desc = 'desc',
  /** in the descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in the descending order, nulls last */
  DescNullsLast = 'desc_nulls_last',
}

/** query root */
export type Query_Root = {
  /** fetch data from the table: "blocks_log" */
  blocks_log: Array<Blocks_Log>;
  /** fetch data from the table: "blocks_log" using primary key columns */
  blocks_log_by_pk?: Maybe<Blocks_Log>;
  /** fetch data from the table: "channels_stats" */
  channels_stats: Array<Channels_Stats>;
  /** fetch aggregated fields from the table: "channels_stats" */
  channels_stats_aggregate: Channels_Stats_Aggregate;
  /** fetch data from the table: "channels_stats" using primary key columns */
  channels_stats_by_pk?: Maybe<Channels_Stats>;
  /** fetch data from the table: "flat.blockchain_relations" */
  flat_blockchain_relations: Array<Flat_Blockchain_Relations>;
  /** fetch aggregated fields from the table: "flat.blockchain_relations" */
  flat_blockchain_relations_aggregate: Flat_Blockchain_Relations_Aggregate;
  /** fetch data from the table: "flat.blockchain_relations" using primary key columns */
  flat_blockchain_relations_by_pk?: Maybe<Flat_Blockchain_Relations>;
  /** fetch data from the table: "flat.blockchain_stats" */
  flat_blockchain_stats: Array<Flat_Blockchain_Stats>;
  /** fetch aggregated fields from the table: "flat.blockchain_stats" */
  flat_blockchain_stats_aggregate: Flat_Blockchain_Stats_Aggregate;
  /** fetch data from the table: "flat.blockchain_stats" using primary key columns */
  flat_blockchain_stats_by_pk?: Maybe<Flat_Blockchain_Stats>;
  /** fetch data from the table: "flat.blockchain_switched_stats" */
  flat_blockchain_switched_stats: Array<Flat_Blockchain_Switched_Stats>;
  /** fetch aggregated fields from the table: "flat.blockchain_switched_stats" */
  flat_blockchain_switched_stats_aggregate: Flat_Blockchain_Switched_Stats_Aggregate;
  /** fetch data from the table: "flat.blockchain_switched_stats" using primary key columns */
  flat_blockchain_switched_stats_by_pk?: Maybe<Flat_Blockchain_Switched_Stats>;
  /** fetch data from the table: "flat.blockchain_tf_chart_type" */
  flat_blockchain_tf_chart_type: Array<Flat_Blockchain_Tf_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_chart_type" */
  flat_blockchain_tf_chart_type_aggregate: Flat_Blockchain_Tf_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_chart_type" using primary key columns */
  flat_blockchain_tf_chart_type_by_pk?: Maybe<Flat_Blockchain_Tf_Chart_Type>;
  /** fetch data from the table: "flat.blockchain_tf_charts" */
  flat_blockchain_tf_charts: Array<Flat_Blockchain_Tf_Charts>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_charts" */
  flat_blockchain_tf_charts_aggregate: Flat_Blockchain_Tf_Charts_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_charts" using primary key columns */
  flat_blockchain_tf_charts_by_pk?: Maybe<Flat_Blockchain_Tf_Charts>;
  /** fetch data from the table: "flat.blockchain_tf_switched_chart_type" */
  flat_blockchain_tf_switched_chart_type: Array<Flat_Blockchain_Tf_Switched_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_switched_chart_type" */
  flat_blockchain_tf_switched_chart_type_aggregate: Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_switched_chart_type" using primary key columns */
  flat_blockchain_tf_switched_chart_type_by_pk?: Maybe<Flat_Blockchain_Tf_Switched_Chart_Type>;
  /** fetch data from the table: "flat.blockchain_tf_switched_charts" */
  flat_blockchain_tf_switched_charts: Array<Flat_Blockchain_Tf_Switched_Charts>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_switched_charts" */
  flat_blockchain_tf_switched_charts_aggregate: Flat_Blockchain_Tf_Switched_Charts_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_switched_charts" using primary key columns */
  flat_blockchain_tf_switched_charts_by_pk?: Maybe<Flat_Blockchain_Tf_Switched_Charts>;
  /** fetch data from the table: "flat.blockchains" */
  flat_blockchains: Array<Flat_Blockchains>;
  /** fetch aggregated fields from the table: "flat.blockchains" */
  flat_blockchains_aggregate: Flat_Blockchains_Aggregate;
  /** fetch data from the table: "flat.blockchains" using primary key columns */
  flat_blockchains_by_pk?: Maybe<Flat_Blockchains>;
  /** fetch data from the table: "flat.channels_stats" */
  flat_channels_stats: Array<Flat_Channels_Stats>;
  /** fetch aggregated fields from the table: "flat.channels_stats" */
  flat_channels_stats_aggregate: Flat_Channels_Stats_Aggregate;
  /** fetch data from the table: "flat.channels_stats" using primary key columns */
  flat_channels_stats_by_pk?: Maybe<Flat_Channels_Stats>;
  /** fetch data from the table: "flat.defillama_txs" */
  flat_defillama_txs: Array<Flat_Defillama_Txs>;
  /** fetch aggregated fields from the table: "flat.defillama_txs" */
  flat_defillama_txs_aggregate: Flat_Defillama_Txs_Aggregate;
  /** fetch data from the table: "flat.defillama_txs" using primary key columns */
  flat_defillama_txs_by_pk?: Maybe<Flat_Defillama_Txs>;
  /** fetch data from the table: "flat.timeframes" */
  flat_timeframes: Array<Flat_Timeframes>;
  /** fetch aggregated fields from the table: "flat.timeframes" */
  flat_timeframes_aggregate: Flat_Timeframes_Aggregate;
  /** fetch data from the table: "flat.timeframes" using primary key columns */
  flat_timeframes_by_pk?: Maybe<Flat_Timeframes>;
  /** fetch data from the table: "flat.token_chart_type" */
  flat_token_chart_type: Array<Flat_Token_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.token_chart_type" */
  flat_token_chart_type_aggregate: Flat_Token_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.token_chart_type" using primary key columns */
  flat_token_chart_type_by_pk?: Maybe<Flat_Token_Chart_Type>;
  /** fetch data from the table: "flat.token_charts" */
  flat_token_charts: Array<Flat_Token_Charts>;
  /** fetch aggregated fields from the table: "flat.token_charts" */
  flat_token_charts_aggregate: Flat_Token_Charts_Aggregate;
  /** fetch data from the table: "flat.token_charts" using primary key columns */
  flat_token_charts_by_pk?: Maybe<Flat_Token_Charts>;
  /** fetch data from the table: "flat.tokens" */
  flat_tokens: Array<Flat_Tokens>;
  /** fetch aggregated fields from the table: "flat.tokens" */
  flat_tokens_aggregate: Flat_Tokens_Aggregate;
  /** fetch data from the table: "flat.tokens" using primary key columns */
  flat_tokens_by_pk?: Maybe<Flat_Tokens>;
  /** fetch data from the table: "flat.total_tf_switched_chart_type" */
  flat_total_tf_switched_chart_type: Array<Flat_Total_Tf_Switched_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.total_tf_switched_chart_type" */
  flat_total_tf_switched_chart_type_aggregate: Flat_Total_Tf_Switched_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.total_tf_switched_chart_type" using primary key columns */
  flat_total_tf_switched_chart_type_by_pk?: Maybe<Flat_Total_Tf_Switched_Chart_Type>;
  /** fetch data from the table: "flat.total_tf_switched_charts" */
  flat_total_tf_switched_charts: Array<Flat_Total_Tf_Switched_Charts>;
  /** fetch aggregated fields from the table: "flat.total_tf_switched_charts" */
  flat_total_tf_switched_charts_aggregate: Flat_Total_Tf_Switched_Charts_Aggregate;
  /** fetch data from the table: "flat.total_tf_switched_charts" using primary key columns */
  flat_total_tf_switched_charts_by_pk?: Maybe<Flat_Total_Tf_Switched_Charts>;
  /** fetch data from the table: "ft_channel_group_stats" */
  ft_channel_group_stats: Array<Ft_Channel_Group_Stats>;
  /** fetch aggregated fields from the table: "ft_channel_group_stats" */
  ft_channel_group_stats_aggregate: Ft_Channel_Group_Stats_Aggregate;
  /** fetch data from the table: "ft_channel_group_stats" using primary key columns */
  ft_channel_group_stats_by_pk?: Maybe<Ft_Channel_Group_Stats>;
  /** fetch data from the table: "ft_channels_stats" */
  ft_channels_stats: Array<Ft_Channels_Stats>;
  /** fetch aggregated fields from the table: "ft_channels_stats" */
  ft_channels_stats_aggregate: Ft_Channels_Stats_Aggregate;
  /** fetch data from the table: "ft_channels_stats" using primary key columns */
  ft_channels_stats_by_pk?: Maybe<Ft_Channels_Stats>;
  /** fetch data from the table: "headers" */
  headers: Array<Headers>;
  /** fetch aggregated fields from the table: "headers" */
  headers_aggregate: Headers_Aggregate;
  /** fetch data from the table: "headers" using primary key columns */
  headers_by_pk?: Maybe<Headers>;
  /** fetch data from the table: "nodes_addrs" */
  nodes_addrs: Array<Nodes_Addrs>;
  /** fetch aggregated fields from the table: "nodes_addrs" */
  nodes_addrs_aggregate: Nodes_Addrs_Aggregate;
  /** fetch data from the table: "nodes_addrs" using primary key columns */
  nodes_addrs_by_pk?: Maybe<Nodes_Addrs>;
  /** fetch data from the table: "nodes_lcd_addrs" */
  nodes_lcd_addrs: Array<Nodes_Lcd_Addrs>;
  /** fetch aggregated fields from the table: "nodes_lcd_addrs" */
  nodes_lcd_addrs_aggregate: Nodes_Lcd_Addrs_Aggregate;
  /** fetch data from the table: "nodes_lcd_addrs" using primary key columns */
  nodes_lcd_addrs_by_pk?: Maybe<Nodes_Lcd_Addrs>;
  /** fetch data from the table: "nodes_rpc_addrs" */
  nodes_rpc_addrs: Array<Nodes_Rpc_Addrs>;
  /** fetch aggregated fields from the table: "nodes_rpc_addrs" */
  nodes_rpc_addrs_aggregate: Nodes_Rpc_Addrs_Aggregate;
  /** fetch data from the table: "nodes_rpc_addrs" using primary key columns */
  nodes_rpc_addrs_by_pk?: Maybe<Nodes_Rpc_Addrs>;
  /** fetch data from the table: "zone_nodes" */
  zone_nodes: Array<Zone_Nodes>;
  /** fetch aggregated fields from the table: "zone_nodes" */
  zone_nodes_aggregate: Zone_Nodes_Aggregate;
  /** fetch data from the table: "zone_nodes" using primary key columns */
  zone_nodes_by_pk?: Maybe<Zone_Nodes>;
  /** fetch data from the table: "zones_graphs" */
  zones_graphs: Array<Zones_Graphs>;
  /** fetch aggregated fields from the table: "zones_graphs" */
  zones_graphs_aggregate: Zones_Graphs_Aggregate;
  /** fetch data from the table: "zones_graphs" using primary key columns */
  zones_graphs_by_pk?: Maybe<Zones_Graphs>;
  /** fetch data from the table: "zones_stats" */
  zones_stats: Array<Zones_Stats>;
  /** fetch aggregated fields from the table: "zones_stats" */
  zones_stats_aggregate: Zones_Stats_Aggregate;
  /** fetch data from the table: "zones_stats" using primary key columns */
  zones_stats_by_pk?: Maybe<Zones_Stats>;
};

/** query root */
export type Query_RootBlocks_LogArgs = {
  distinct_on?: InputMaybe<Array<Blocks_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blocks_Log_Order_By>>;
  where?: InputMaybe<Blocks_Log_Bool_Exp>;
};

/** query root */
export type Query_RootBlocks_Log_By_PkArgs = {
  zone: Scalars['String'];
};

/** query root */
export type Query_RootChannels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Channels_Stats_Order_By>>;
  where?: InputMaybe<Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootChannels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Channels_Stats_Order_By>>;
  where?: InputMaybe<Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootChannels_Stats_By_PkArgs = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  zone: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Blockchain_RelationsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Relations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Relations_By_PkArgs = {
  blockchain_source: Scalars['String'];
  blockchain_target: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Blockchain_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Blockchain_Switched_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Switched_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Switched_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchain_Tf_Switched_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_BlockchainsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Blockchains_By_PkArgs = {
  network_id: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Channels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Channels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Channels_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  channel_id: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Defillama_TxsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Defillama_Txs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Defillama_Txs_Order_By>>;
  where?: InputMaybe<Flat_Defillama_Txs_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Defillama_Txs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Defillama_Txs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Defillama_Txs_Order_By>>;
  where?: InputMaybe<Flat_Defillama_Txs_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Defillama_Txs_By_PkArgs = {
  base_denom: Scalars['String'];
  blockchain: Scalars['String'];
  tx_hash: Scalars['String'];
};

/** query root */
export type Query_RootFlat_TimeframesArgs = {
  distinct_on?: InputMaybe<Array<Flat_Timeframes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Timeframes_Order_By>>;
  where?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Timeframes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Timeframes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Timeframes_Order_By>>;
  where?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Timeframes_By_PkArgs = {
  timeframe_in_hours: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_Token_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Token_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Token_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Token_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Token_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Token_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  denom: Scalars['String'];
  point_index: Scalars['Int'];
};

/** query root */
export type Query_RootFlat_TokensArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Tokens_By_PkArgs = {
  blockchain: Scalars['String'];
  denom: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** query root */
export type Query_RootFlat_Total_Tf_Switched_Charts_By_PkArgs = {
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootFt_Channel_Group_StatsArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channel_Group_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channel_Group_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFt_Channel_Group_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channel_Group_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channel_Group_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFt_Channel_Group_Stats_By_PkArgs = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
  zone_counterparty: Scalars['String'];
};

/** query root */
export type Query_RootFt_Channels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channels_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFt_Channels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channels_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channels_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootFt_Channels_Stats_By_PkArgs = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** query root */
export type Query_RootHeadersArgs = {
  distinct_on?: InputMaybe<Array<Headers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Headers_Order_By>>;
  where?: InputMaybe<Headers_Bool_Exp>;
};

/** query root */
export type Query_RootHeaders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Headers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Headers_Order_By>>;
  where?: InputMaybe<Headers_Bool_Exp>;
};

/** query root */
export type Query_RootHeaders_By_PkArgs = {
  is_mainnet_only: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootNodes_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Addrs_By_PkArgs = {
  ip_or_dns: Scalars['String'];
};

/** query root */
export type Query_RootNodes_Lcd_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Lcd_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Lcd_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Lcd_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Lcd_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Lcd_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Lcd_Addrs_By_PkArgs = {
  lcd_addr: Scalars['String'];
};

/** query root */
export type Query_RootNodes_Rpc_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Rpc_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Rpc_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Rpc_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Rpc_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Rpc_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>;
};

/** query root */
export type Query_RootNodes_Rpc_Addrs_By_PkArgs = {
  rpc_addr: Scalars['String'];
};

/** query root */
export type Query_RootZone_NodesArgs = {
  distinct_on?: InputMaybe<Array<Zone_Nodes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zone_Nodes_Order_By>>;
  where?: InputMaybe<Zone_Nodes_Bool_Exp>;
};

/** query root */
export type Query_RootZone_Nodes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zone_Nodes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zone_Nodes_Order_By>>;
  where?: InputMaybe<Zone_Nodes_Bool_Exp>;
};

/** query root */
export type Query_RootZone_Nodes_By_PkArgs = {
  rpc_addr: Scalars['String'];
};

/** query root */
export type Query_RootZones_GraphsArgs = {
  distinct_on?: InputMaybe<Array<Zones_Graphs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Graphs_Order_By>>;
  where?: InputMaybe<Zones_Graphs_Bool_Exp>;
};

/** query root */
export type Query_RootZones_Graphs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zones_Graphs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Graphs_Order_By>>;
  where?: InputMaybe<Zones_Graphs_Bool_Exp>;
};

/** query root */
export type Query_RootZones_Graphs_By_PkArgs = {
  source: Scalars['String'];
  target: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** query root */
export type Query_RootZones_StatsArgs = {
  distinct_on?: InputMaybe<Array<Zones_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Stats_Order_By>>;
  where?: InputMaybe<Zones_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootZones_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zones_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Stats_Order_By>>;
  where?: InputMaybe<Zones_Stats_Bool_Exp>;
};

/** query root */
export type Query_RootZones_Stats_By_PkArgs = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** subscription root */
export type Subscription_Root = {
  /** fetch data from the table: "blocks_log" */
  blocks_log: Array<Blocks_Log>;
  /** fetch data from the table: "blocks_log" using primary key columns */
  blocks_log_by_pk?: Maybe<Blocks_Log>;
  /** fetch data from the table: "channels_stats" */
  channels_stats: Array<Channels_Stats>;
  /** fetch aggregated fields from the table: "channels_stats" */
  channels_stats_aggregate: Channels_Stats_Aggregate;
  /** fetch data from the table: "channels_stats" using primary key columns */
  channels_stats_by_pk?: Maybe<Channels_Stats>;
  /** fetch data from the table: "flat.blockchain_relations" */
  flat_blockchain_relations: Array<Flat_Blockchain_Relations>;
  /** fetch aggregated fields from the table: "flat.blockchain_relations" */
  flat_blockchain_relations_aggregate: Flat_Blockchain_Relations_Aggregate;
  /** fetch data from the table: "flat.blockchain_relations" using primary key columns */
  flat_blockchain_relations_by_pk?: Maybe<Flat_Blockchain_Relations>;
  /** fetch data from the table: "flat.blockchain_stats" */
  flat_blockchain_stats: Array<Flat_Blockchain_Stats>;
  /** fetch aggregated fields from the table: "flat.blockchain_stats" */
  flat_blockchain_stats_aggregate: Flat_Blockchain_Stats_Aggregate;
  /** fetch data from the table: "flat.blockchain_stats" using primary key columns */
  flat_blockchain_stats_by_pk?: Maybe<Flat_Blockchain_Stats>;
  /** fetch data from the table: "flat.blockchain_switched_stats" */
  flat_blockchain_switched_stats: Array<Flat_Blockchain_Switched_Stats>;
  /** fetch aggregated fields from the table: "flat.blockchain_switched_stats" */
  flat_blockchain_switched_stats_aggregate: Flat_Blockchain_Switched_Stats_Aggregate;
  /** fetch data from the table: "flat.blockchain_switched_stats" using primary key columns */
  flat_blockchain_switched_stats_by_pk?: Maybe<Flat_Blockchain_Switched_Stats>;
  /** fetch data from the table: "flat.blockchain_tf_chart_type" */
  flat_blockchain_tf_chart_type: Array<Flat_Blockchain_Tf_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_chart_type" */
  flat_blockchain_tf_chart_type_aggregate: Flat_Blockchain_Tf_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_chart_type" using primary key columns */
  flat_blockchain_tf_chart_type_by_pk?: Maybe<Flat_Blockchain_Tf_Chart_Type>;
  /** fetch data from the table: "flat.blockchain_tf_charts" */
  flat_blockchain_tf_charts: Array<Flat_Blockchain_Tf_Charts>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_charts" */
  flat_blockchain_tf_charts_aggregate: Flat_Blockchain_Tf_Charts_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_charts" using primary key columns */
  flat_blockchain_tf_charts_by_pk?: Maybe<Flat_Blockchain_Tf_Charts>;
  /** fetch data from the table: "flat.blockchain_tf_switched_chart_type" */
  flat_blockchain_tf_switched_chart_type: Array<Flat_Blockchain_Tf_Switched_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_switched_chart_type" */
  flat_blockchain_tf_switched_chart_type_aggregate: Flat_Blockchain_Tf_Switched_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_switched_chart_type" using primary key columns */
  flat_blockchain_tf_switched_chart_type_by_pk?: Maybe<Flat_Blockchain_Tf_Switched_Chart_Type>;
  /** fetch data from the table: "flat.blockchain_tf_switched_charts" */
  flat_blockchain_tf_switched_charts: Array<Flat_Blockchain_Tf_Switched_Charts>;
  /** fetch aggregated fields from the table: "flat.blockchain_tf_switched_charts" */
  flat_blockchain_tf_switched_charts_aggregate: Flat_Blockchain_Tf_Switched_Charts_Aggregate;
  /** fetch data from the table: "flat.blockchain_tf_switched_charts" using primary key columns */
  flat_blockchain_tf_switched_charts_by_pk?: Maybe<Flat_Blockchain_Tf_Switched_Charts>;
  /** fetch data from the table: "flat.blockchains" */
  flat_blockchains: Array<Flat_Blockchains>;
  /** fetch aggregated fields from the table: "flat.blockchains" */
  flat_blockchains_aggregate: Flat_Blockchains_Aggregate;
  /** fetch data from the table: "flat.blockchains" using primary key columns */
  flat_blockchains_by_pk?: Maybe<Flat_Blockchains>;
  /** fetch data from the table: "flat.channels_stats" */
  flat_channels_stats: Array<Flat_Channels_Stats>;
  /** fetch aggregated fields from the table: "flat.channels_stats" */
  flat_channels_stats_aggregate: Flat_Channels_Stats_Aggregate;
  /** fetch data from the table: "flat.channels_stats" using primary key columns */
  flat_channels_stats_by_pk?: Maybe<Flat_Channels_Stats>;
  /** fetch data from the table: "flat.defillama_txs" */
  flat_defillama_txs: Array<Flat_Defillama_Txs>;
  /** fetch aggregated fields from the table: "flat.defillama_txs" */
  flat_defillama_txs_aggregate: Flat_Defillama_Txs_Aggregate;
  /** fetch data from the table: "flat.defillama_txs" using primary key columns */
  flat_defillama_txs_by_pk?: Maybe<Flat_Defillama_Txs>;
  /** fetch data from the table: "flat.timeframes" */
  flat_timeframes: Array<Flat_Timeframes>;
  /** fetch aggregated fields from the table: "flat.timeframes" */
  flat_timeframes_aggregate: Flat_Timeframes_Aggregate;
  /** fetch data from the table: "flat.timeframes" using primary key columns */
  flat_timeframes_by_pk?: Maybe<Flat_Timeframes>;
  /** fetch data from the table: "flat.token_chart_type" */
  flat_token_chart_type: Array<Flat_Token_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.token_chart_type" */
  flat_token_chart_type_aggregate: Flat_Token_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.token_chart_type" using primary key columns */
  flat_token_chart_type_by_pk?: Maybe<Flat_Token_Chart_Type>;
  /** fetch data from the table: "flat.token_charts" */
  flat_token_charts: Array<Flat_Token_Charts>;
  /** fetch aggregated fields from the table: "flat.token_charts" */
  flat_token_charts_aggregate: Flat_Token_Charts_Aggregate;
  /** fetch data from the table: "flat.token_charts" using primary key columns */
  flat_token_charts_by_pk?: Maybe<Flat_Token_Charts>;
  /** fetch data from the table: "flat.tokens" */
  flat_tokens: Array<Flat_Tokens>;
  /** fetch aggregated fields from the table: "flat.tokens" */
  flat_tokens_aggregate: Flat_Tokens_Aggregate;
  /** fetch data from the table: "flat.tokens" using primary key columns */
  flat_tokens_by_pk?: Maybe<Flat_Tokens>;
  /** fetch data from the table: "flat.total_tf_switched_chart_type" */
  flat_total_tf_switched_chart_type: Array<Flat_Total_Tf_Switched_Chart_Type>;
  /** fetch aggregated fields from the table: "flat.total_tf_switched_chart_type" */
  flat_total_tf_switched_chart_type_aggregate: Flat_Total_Tf_Switched_Chart_Type_Aggregate;
  /** fetch data from the table: "flat.total_tf_switched_chart_type" using primary key columns */
  flat_total_tf_switched_chart_type_by_pk?: Maybe<Flat_Total_Tf_Switched_Chart_Type>;
  /** fetch data from the table: "flat.total_tf_switched_charts" */
  flat_total_tf_switched_charts: Array<Flat_Total_Tf_Switched_Charts>;
  /** fetch aggregated fields from the table: "flat.total_tf_switched_charts" */
  flat_total_tf_switched_charts_aggregate: Flat_Total_Tf_Switched_Charts_Aggregate;
  /** fetch data from the table: "flat.total_tf_switched_charts" using primary key columns */
  flat_total_tf_switched_charts_by_pk?: Maybe<Flat_Total_Tf_Switched_Charts>;
  /** fetch data from the table: "ft_channel_group_stats" */
  ft_channel_group_stats: Array<Ft_Channel_Group_Stats>;
  /** fetch aggregated fields from the table: "ft_channel_group_stats" */
  ft_channel_group_stats_aggregate: Ft_Channel_Group_Stats_Aggregate;
  /** fetch data from the table: "ft_channel_group_stats" using primary key columns */
  ft_channel_group_stats_by_pk?: Maybe<Ft_Channel_Group_Stats>;
  /** fetch data from the table: "ft_channels_stats" */
  ft_channels_stats: Array<Ft_Channels_Stats>;
  /** fetch aggregated fields from the table: "ft_channels_stats" */
  ft_channels_stats_aggregate: Ft_Channels_Stats_Aggregate;
  /** fetch data from the table: "ft_channels_stats" using primary key columns */
  ft_channels_stats_by_pk?: Maybe<Ft_Channels_Stats>;
  /** fetch data from the table: "headers" */
  headers: Array<Headers>;
  /** fetch aggregated fields from the table: "headers" */
  headers_aggregate: Headers_Aggregate;
  /** fetch data from the table: "headers" using primary key columns */
  headers_by_pk?: Maybe<Headers>;
  /** fetch data from the table: "nodes_addrs" */
  nodes_addrs: Array<Nodes_Addrs>;
  /** fetch aggregated fields from the table: "nodes_addrs" */
  nodes_addrs_aggregate: Nodes_Addrs_Aggregate;
  /** fetch data from the table: "nodes_addrs" using primary key columns */
  nodes_addrs_by_pk?: Maybe<Nodes_Addrs>;
  /** fetch data from the table: "nodes_lcd_addrs" */
  nodes_lcd_addrs: Array<Nodes_Lcd_Addrs>;
  /** fetch aggregated fields from the table: "nodes_lcd_addrs" */
  nodes_lcd_addrs_aggregate: Nodes_Lcd_Addrs_Aggregate;
  /** fetch data from the table: "nodes_lcd_addrs" using primary key columns */
  nodes_lcd_addrs_by_pk?: Maybe<Nodes_Lcd_Addrs>;
  /** fetch data from the table: "nodes_rpc_addrs" */
  nodes_rpc_addrs: Array<Nodes_Rpc_Addrs>;
  /** fetch aggregated fields from the table: "nodes_rpc_addrs" */
  nodes_rpc_addrs_aggregate: Nodes_Rpc_Addrs_Aggregate;
  /** fetch data from the table: "nodes_rpc_addrs" using primary key columns */
  nodes_rpc_addrs_by_pk?: Maybe<Nodes_Rpc_Addrs>;
  /** fetch data from the table: "zone_nodes" */
  zone_nodes: Array<Zone_Nodes>;
  /** fetch aggregated fields from the table: "zone_nodes" */
  zone_nodes_aggregate: Zone_Nodes_Aggregate;
  /** fetch data from the table: "zone_nodes" using primary key columns */
  zone_nodes_by_pk?: Maybe<Zone_Nodes>;
  /** fetch data from the table: "zones_graphs" */
  zones_graphs: Array<Zones_Graphs>;
  /** fetch aggregated fields from the table: "zones_graphs" */
  zones_graphs_aggregate: Zones_Graphs_Aggregate;
  /** fetch data from the table: "zones_graphs" using primary key columns */
  zones_graphs_by_pk?: Maybe<Zones_Graphs>;
  /** fetch data from the table: "zones_stats" */
  zones_stats: Array<Zones_Stats>;
  /** fetch aggregated fields from the table: "zones_stats" */
  zones_stats_aggregate: Zones_Stats_Aggregate;
  /** fetch data from the table: "zones_stats" using primary key columns */
  zones_stats_by_pk?: Maybe<Zones_Stats>;
};

/** subscription root */
export type Subscription_RootBlocks_LogArgs = {
  distinct_on?: InputMaybe<Array<Blocks_Log_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Blocks_Log_Order_By>>;
  where?: InputMaybe<Blocks_Log_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootBlocks_Log_By_PkArgs = {
  zone: Scalars['String'];
};

/** subscription root */
export type Subscription_RootChannels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Channels_Stats_Order_By>>;
  where?: InputMaybe<Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootChannels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Channels_Stats_Order_By>>;
  where?: InputMaybe<Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootChannels_Stats_By_PkArgs = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  zone: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_RelationsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Relations_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Relations_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Relations_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Relations_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Relations_By_PkArgs = {
  blockchain_source: Scalars['String'];
  blockchain_target: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Switched_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Switched_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Switched_Stats_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Switched_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Switched_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchain_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Blockchain_Tf_Switched_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchain_Tf_Switched_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_BlockchainsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Blockchains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Blockchains_Order_By>>;
  where?: InputMaybe<Flat_Blockchains_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Blockchains_By_PkArgs = {
  network_id: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Channels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Channels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Channels_Stats_Order_By>>;
  where?: InputMaybe<Flat_Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Channels_Stats_By_PkArgs = {
  blockchain: Scalars['String'];
  channel_id: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Defillama_TxsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Defillama_Txs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Defillama_Txs_Order_By>>;
  where?: InputMaybe<Flat_Defillama_Txs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Defillama_Txs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Defillama_Txs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Defillama_Txs_Order_By>>;
  where?: InputMaybe<Flat_Defillama_Txs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Defillama_Txs_By_PkArgs = {
  base_denom: Scalars['String'];
  blockchain: Scalars['String'];
  tx_hash: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_TimeframesArgs = {
  distinct_on?: InputMaybe<Array<Flat_Timeframes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Timeframes_Order_By>>;
  where?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Timeframes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Timeframes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Timeframes_Order_By>>;
  where?: InputMaybe<Flat_Timeframes_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Timeframes_By_PkArgs = {
  timeframe_in_hours: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_Token_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Token_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Token_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Token_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Token_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Token_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Token_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Token_Charts_Order_By>>;
  where?: InputMaybe<Flat_Token_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Token_Charts_By_PkArgs = {
  blockchain: Scalars['String'];
  chart_type: Scalars['String'];
  denom: Scalars['String'];
  point_index: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFlat_TokensArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Tokens_Order_By>>;
  where?: InputMaybe<Flat_Tokens_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Tokens_By_PkArgs = {
  blockchain: Scalars['String'];
  denom: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_Chart_TypeArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_Chart_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Chart_Type_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Chart_Type_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_Chart_Type_By_PkArgs = {
  chart_type: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_ChartsArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_Charts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Flat_Total_Tf_Switched_Charts_Order_By>>;
  where?: InputMaybe<Flat_Total_Tf_Switched_Charts_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFlat_Total_Tf_Switched_Charts_By_PkArgs = {
  chart_type: Scalars['String'];
  is_mainnet: Scalars['Boolean'];
  point_index: Scalars['Int'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootFt_Channel_Group_StatsArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channel_Group_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channel_Group_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFt_Channel_Group_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channel_Group_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channel_Group_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channel_Group_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFt_Channel_Group_Stats_By_PkArgs = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
  zone_counterparty: Scalars['String'];
};

/** subscription root */
export type Subscription_RootFt_Channels_StatsArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channels_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFt_Channels_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Ft_Channels_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Ft_Channels_Stats_Order_By>>;
  where?: InputMaybe<Ft_Channels_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootFt_Channels_Stats_By_PkArgs = {
  channel_id: Scalars['String'];
  client_id: Scalars['String'];
  connection_id: Scalars['String'];
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** subscription root */
export type Subscription_RootHeadersArgs = {
  distinct_on?: InputMaybe<Array<Headers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Headers_Order_By>>;
  where?: InputMaybe<Headers_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootHeaders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Headers_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Headers_Order_By>>;
  where?: InputMaybe<Headers_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootHeaders_By_PkArgs = {
  is_mainnet_only: Scalars['Boolean'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootNodes_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Addrs_By_PkArgs = {
  ip_or_dns: Scalars['String'];
};

/** subscription root */
export type Subscription_RootNodes_Lcd_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Lcd_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Lcd_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Lcd_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Lcd_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Lcd_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Lcd_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Lcd_Addrs_By_PkArgs = {
  lcd_addr: Scalars['String'];
};

/** subscription root */
export type Subscription_RootNodes_Rpc_AddrsArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Rpc_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Rpc_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Rpc_Addrs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Nodes_Rpc_Addrs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Nodes_Rpc_Addrs_Order_By>>;
  where?: InputMaybe<Nodes_Rpc_Addrs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootNodes_Rpc_Addrs_By_PkArgs = {
  rpc_addr: Scalars['String'];
};

/** subscription root */
export type Subscription_RootZone_NodesArgs = {
  distinct_on?: InputMaybe<Array<Zone_Nodes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zone_Nodes_Order_By>>;
  where?: InputMaybe<Zone_Nodes_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZone_Nodes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zone_Nodes_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zone_Nodes_Order_By>>;
  where?: InputMaybe<Zone_Nodes_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZone_Nodes_By_PkArgs = {
  rpc_addr: Scalars['String'];
};

/** subscription root */
export type Subscription_RootZones_GraphsArgs = {
  distinct_on?: InputMaybe<Array<Zones_Graphs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Graphs_Order_By>>;
  where?: InputMaybe<Zones_Graphs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZones_Graphs_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zones_Graphs_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Graphs_Order_By>>;
  where?: InputMaybe<Zones_Graphs_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZones_Graphs_By_PkArgs = {
  source: Scalars['String'];
  target: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** subscription root */
export type Subscription_RootZones_StatsArgs = {
  distinct_on?: InputMaybe<Array<Zones_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Stats_Order_By>>;
  where?: InputMaybe<Zones_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZones_Stats_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Zones_Stats_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Zones_Stats_Order_By>>;
  where?: InputMaybe<Zones_Stats_Bool_Exp>;
};

/** subscription root */
export type Subscription_RootZones_Stats_By_PkArgs = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** expression to compare columns of type timestamp. All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']>;
  _gt?: InputMaybe<Scalars['timestamp']>;
  _gte?: InputMaybe<Scalars['timestamp']>;
  _in?: InputMaybe<Array<Scalars['timestamp']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamp']>;
  _lte?: InputMaybe<Scalars['timestamp']>;
  _neq?: InputMaybe<Scalars['timestamp']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']>>;
};

/** columns and relationships of "zone_nodes" */
export type Zone_Nodes = {
  connection_duration?: Maybe<Scalars['bigint']>;
  earliest_block_height?: Maybe<Scalars['Int']>;
  ip?: Maybe<Scalars['String']>;
  is_alive: Scalars['Boolean'];
  is_hidden?: Maybe<Scalars['Boolean']>;
  is_hosting_location?: Maybe<Scalars['Boolean']>;
  is_lcd_addr_active?: Maybe<Scalars['Boolean']>;
  is_prioritized?: Maybe<Scalars['Boolean']>;
  is_recv_connection_active?: Maybe<Scalars['Boolean']>;
  is_rpc_addr_active?: Maybe<Scalars['Boolean']>;
  is_send_connection_active?: Maybe<Scalars['Boolean']>;
  last_block_height?: Maybe<Scalars['Int']>;
  last_checked_at: Scalars['timestamp'];
  last_worked_at: Scalars['timestamp'];
  lcd_addr?: Maybe<Scalars['String']>;
  location_city?: Maybe<Scalars['String']>;
  location_continent?: Maybe<Scalars['String']>;
  location_continent_code?: Maybe<Scalars['String']>;
  location_country?: Maybe<Scalars['String']>;
  location_country_code?: Maybe<Scalars['String']>;
  location_district?: Maybe<Scalars['String']>;
  location_isp_name?: Maybe<Scalars['String']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_org?: Maybe<Scalars['String']>;
  location_org_as?: Maybe<Scalars['String']>;
  location_org_as_name?: Maybe<Scalars['String']>;
  location_region?: Maybe<Scalars['String']>;
  location_region_name?: Maybe<Scalars['String']>;
  location_timezone?: Maybe<Scalars['String']>;
  location_timezone_offset?: Maybe<Scalars['Int']>;
  location_zip?: Maybe<Scalars['String']>;
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  rpc_addr: Scalars['String'];
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone: Scalars['String'];
};

/** aggregated selection of "zone_nodes" */
export type Zone_Nodes_Aggregate = {
  aggregate?: Maybe<Zone_Nodes_Aggregate_Fields>;
  nodes: Array<Zone_Nodes>;
};

/** aggregate fields of "zone_nodes" */
export type Zone_Nodes_Aggregate_Fields = {
  avg?: Maybe<Zone_Nodes_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Zone_Nodes_Max_Fields>;
  min?: Maybe<Zone_Nodes_Min_Fields>;
  stddev?: Maybe<Zone_Nodes_Stddev_Fields>;
  stddev_pop?: Maybe<Zone_Nodes_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Zone_Nodes_Stddev_Samp_Fields>;
  sum?: Maybe<Zone_Nodes_Sum_Fields>;
  var_pop?: Maybe<Zone_Nodes_Var_Pop_Fields>;
  var_samp?: Maybe<Zone_Nodes_Var_Samp_Fields>;
  variance?: Maybe<Zone_Nodes_Variance_Fields>;
};

/** aggregate fields of "zone_nodes" */
export type Zone_Nodes_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Zone_Nodes_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "zone_nodes" */
export type Zone_Nodes_Aggregate_Order_By = {
  avg?: InputMaybe<Zone_Nodes_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Zone_Nodes_Max_Order_By>;
  min?: InputMaybe<Zone_Nodes_Min_Order_By>;
  stddev?: InputMaybe<Zone_Nodes_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Zone_Nodes_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Zone_Nodes_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Zone_Nodes_Sum_Order_By>;
  var_pop?: InputMaybe<Zone_Nodes_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Zone_Nodes_Var_Samp_Order_By>;
  variance?: InputMaybe<Zone_Nodes_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Zone_Nodes_Avg_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "zone_nodes" */
export type Zone_Nodes_Avg_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "zone_nodes". All fields are combined with a logical 'AND'. */
export type Zone_Nodes_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Zone_Nodes_Bool_Exp>>>;
  _not?: InputMaybe<Zone_Nodes_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Zone_Nodes_Bool_Exp>>>;
  connection_duration?: InputMaybe<Bigint_Comparison_Exp>;
  earliest_block_height?: InputMaybe<Int_Comparison_Exp>;
  ip?: InputMaybe<String_Comparison_Exp>;
  is_alive?: InputMaybe<Boolean_Comparison_Exp>;
  is_hidden?: InputMaybe<Boolean_Comparison_Exp>;
  is_hosting_location?: InputMaybe<Boolean_Comparison_Exp>;
  is_lcd_addr_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_prioritized?: InputMaybe<Boolean_Comparison_Exp>;
  is_recv_connection_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_rpc_addr_active?: InputMaybe<Boolean_Comparison_Exp>;
  is_send_connection_active?: InputMaybe<Boolean_Comparison_Exp>;
  last_block_height?: InputMaybe<Int_Comparison_Exp>;
  last_checked_at?: InputMaybe<Timestamp_Comparison_Exp>;
  last_worked_at?: InputMaybe<Timestamp_Comparison_Exp>;
  lcd_addr?: InputMaybe<String_Comparison_Exp>;
  location_city?: InputMaybe<String_Comparison_Exp>;
  location_continent?: InputMaybe<String_Comparison_Exp>;
  location_continent_code?: InputMaybe<String_Comparison_Exp>;
  location_country?: InputMaybe<String_Comparison_Exp>;
  location_country_code?: InputMaybe<String_Comparison_Exp>;
  location_district?: InputMaybe<String_Comparison_Exp>;
  location_isp_name?: InputMaybe<String_Comparison_Exp>;
  location_lat?: InputMaybe<Float_Comparison_Exp>;
  location_lon?: InputMaybe<Float_Comparison_Exp>;
  location_org?: InputMaybe<String_Comparison_Exp>;
  location_org_as?: InputMaybe<String_Comparison_Exp>;
  location_org_as_name?: InputMaybe<String_Comparison_Exp>;
  location_region?: InputMaybe<String_Comparison_Exp>;
  location_region_name?: InputMaybe<String_Comparison_Exp>;
  location_timezone?: InputMaybe<String_Comparison_Exp>;
  location_timezone_offset?: InputMaybe<Int_Comparison_Exp>;
  location_zip?: InputMaybe<String_Comparison_Exp>;
  moniker?: InputMaybe<String_Comparison_Exp>;
  node_id?: InputMaybe<String_Comparison_Exp>;
  rpc_addr?: InputMaybe<String_Comparison_Exp>;
  tx_index?: InputMaybe<String_Comparison_Exp>;
  version?: InputMaybe<String_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Zone_Nodes_Max_Fields = {
  connection_duration?: Maybe<Scalars['bigint']>;
  earliest_block_height?: Maybe<Scalars['Int']>;
  ip?: Maybe<Scalars['String']>;
  last_block_height?: Maybe<Scalars['Int']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  last_worked_at?: Maybe<Scalars['timestamp']>;
  lcd_addr?: Maybe<Scalars['String']>;
  location_city?: Maybe<Scalars['String']>;
  location_continent?: Maybe<Scalars['String']>;
  location_continent_code?: Maybe<Scalars['String']>;
  location_country?: Maybe<Scalars['String']>;
  location_country_code?: Maybe<Scalars['String']>;
  location_district?: Maybe<Scalars['String']>;
  location_isp_name?: Maybe<Scalars['String']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_org?: Maybe<Scalars['String']>;
  location_org_as?: Maybe<Scalars['String']>;
  location_org_as_name?: Maybe<Scalars['String']>;
  location_region?: Maybe<Scalars['String']>;
  location_region_name?: Maybe<Scalars['String']>;
  location_timezone?: Maybe<Scalars['String']>;
  location_timezone_offset?: Maybe<Scalars['Int']>;
  location_zip?: Maybe<Scalars['String']>;
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  rpc_addr?: Maybe<Scalars['String']>;
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "zone_nodes" */
export type Zone_Nodes_Max_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  last_worked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  location_city?: InputMaybe<Order_By>;
  location_continent?: InputMaybe<Order_By>;
  location_continent_code?: InputMaybe<Order_By>;
  location_country?: InputMaybe<Order_By>;
  location_country_code?: InputMaybe<Order_By>;
  location_district?: InputMaybe<Order_By>;
  location_isp_name?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_org?: InputMaybe<Order_By>;
  location_org_as?: InputMaybe<Order_By>;
  location_org_as_name?: InputMaybe<Order_By>;
  location_region?: InputMaybe<Order_By>;
  location_region_name?: InputMaybe<Order_By>;
  location_timezone?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
  location_zip?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Zone_Nodes_Min_Fields = {
  connection_duration?: Maybe<Scalars['bigint']>;
  earliest_block_height?: Maybe<Scalars['Int']>;
  ip?: Maybe<Scalars['String']>;
  last_block_height?: Maybe<Scalars['Int']>;
  last_checked_at?: Maybe<Scalars['timestamp']>;
  last_worked_at?: Maybe<Scalars['timestamp']>;
  lcd_addr?: Maybe<Scalars['String']>;
  location_city?: Maybe<Scalars['String']>;
  location_continent?: Maybe<Scalars['String']>;
  location_continent_code?: Maybe<Scalars['String']>;
  location_country?: Maybe<Scalars['String']>;
  location_country_code?: Maybe<Scalars['String']>;
  location_district?: Maybe<Scalars['String']>;
  location_isp_name?: Maybe<Scalars['String']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_org?: Maybe<Scalars['String']>;
  location_org_as?: Maybe<Scalars['String']>;
  location_org_as_name?: Maybe<Scalars['String']>;
  location_region?: Maybe<Scalars['String']>;
  location_region_name?: Maybe<Scalars['String']>;
  location_timezone?: Maybe<Scalars['String']>;
  location_timezone_offset?: Maybe<Scalars['Int']>;
  location_zip?: Maybe<Scalars['String']>;
  moniker?: Maybe<Scalars['String']>;
  node_id?: Maybe<Scalars['String']>;
  rpc_addr?: Maybe<Scalars['String']>;
  tx_index?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "zone_nodes" */
export type Zone_Nodes_Min_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  last_worked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  location_city?: InputMaybe<Order_By>;
  location_continent?: InputMaybe<Order_By>;
  location_continent_code?: InputMaybe<Order_By>;
  location_country?: InputMaybe<Order_By>;
  location_country_code?: InputMaybe<Order_By>;
  location_district?: InputMaybe<Order_By>;
  location_isp_name?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_org?: InputMaybe<Order_By>;
  location_org_as?: InputMaybe<Order_By>;
  location_org_as_name?: InputMaybe<Order_By>;
  location_region?: InputMaybe<Order_By>;
  location_region_name?: InputMaybe<Order_By>;
  location_timezone?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
  location_zip?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "zone_nodes" */
export type Zone_Nodes_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  ip?: InputMaybe<Order_By>;
  is_alive?: InputMaybe<Order_By>;
  is_hidden?: InputMaybe<Order_By>;
  is_hosting_location?: InputMaybe<Order_By>;
  is_lcd_addr_active?: InputMaybe<Order_By>;
  is_prioritized?: InputMaybe<Order_By>;
  is_recv_connection_active?: InputMaybe<Order_By>;
  is_rpc_addr_active?: InputMaybe<Order_By>;
  is_send_connection_active?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  last_checked_at?: InputMaybe<Order_By>;
  last_worked_at?: InputMaybe<Order_By>;
  lcd_addr?: InputMaybe<Order_By>;
  location_city?: InputMaybe<Order_By>;
  location_continent?: InputMaybe<Order_By>;
  location_continent_code?: InputMaybe<Order_By>;
  location_country?: InputMaybe<Order_By>;
  location_country_code?: InputMaybe<Order_By>;
  location_district?: InputMaybe<Order_By>;
  location_isp_name?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_org?: InputMaybe<Order_By>;
  location_org_as?: InputMaybe<Order_By>;
  location_org_as_name?: InputMaybe<Order_By>;
  location_region?: InputMaybe<Order_By>;
  location_region_name?: InputMaybe<Order_By>;
  location_timezone?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
  location_zip?: InputMaybe<Order_By>;
  moniker?: InputMaybe<Order_By>;
  node_id?: InputMaybe<Order_By>;
  rpc_addr?: InputMaybe<Order_By>;
  tx_index?: InputMaybe<Order_By>;
  version?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "zone_nodes" */
export type Zone_Nodes_Pk_Columns_Input = {
  rpc_addr: Scalars['String'];
};

/** select columns of table "zone_nodes" */
export const enum Zone_Nodes_Select_Column {
  /** column name */
  ConnectionDuration = 'connection_duration',
  /** column name */
  EarliestBlockHeight = 'earliest_block_height',
  /** column name */
  Ip = 'ip',
  /** column name */
  IsAlive = 'is_alive',
  /** column name */
  IsHidden = 'is_hidden',
  /** column name */
  IsHostingLocation = 'is_hosting_location',
  /** column name */
  IsLcdAddrActive = 'is_lcd_addr_active',
  /** column name */
  IsPrioritized = 'is_prioritized',
  /** column name */
  IsRecvConnectionActive = 'is_recv_connection_active',
  /** column name */
  IsRpcAddrActive = 'is_rpc_addr_active',
  /** column name */
  IsSendConnectionActive = 'is_send_connection_active',
  /** column name */
  LastBlockHeight = 'last_block_height',
  /** column name */
  LastCheckedAt = 'last_checked_at',
  /** column name */
  LastWorkedAt = 'last_worked_at',
  /** column name */
  LcdAddr = 'lcd_addr',
  /** column name */
  LocationCity = 'location_city',
  /** column name */
  LocationContinent = 'location_continent',
  /** column name */
  LocationContinentCode = 'location_continent_code',
  /** column name */
  LocationCountry = 'location_country',
  /** column name */
  LocationCountryCode = 'location_country_code',
  /** column name */
  LocationDistrict = 'location_district',
  /** column name */
  LocationIspName = 'location_isp_name',
  /** column name */
  LocationLat = 'location_lat',
  /** column name */
  LocationLon = 'location_lon',
  /** column name */
  LocationOrg = 'location_org',
  /** column name */
  LocationOrgAs = 'location_org_as',
  /** column name */
  LocationOrgAsName = 'location_org_as_name',
  /** column name */
  LocationRegion = 'location_region',
  /** column name */
  LocationRegionName = 'location_region_name',
  /** column name */
  LocationTimezone = 'location_timezone',
  /** column name */
  LocationTimezoneOffset = 'location_timezone_offset',
  /** column name */
  LocationZip = 'location_zip',
  /** column name */
  Moniker = 'moniker',
  /** column name */
  NodeId = 'node_id',
  /** column name */
  RpcAddr = 'rpc_addr',
  /** column name */
  TxIndex = 'tx_index',
  /** column name */
  Version = 'version',
  /** column name */
  Zone = 'zone',
}

/** aggregate stddev on columns */
export type Zone_Nodes_Stddev_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "zone_nodes" */
export type Zone_Nodes_Stddev_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Zone_Nodes_Stddev_Pop_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "zone_nodes" */
export type Zone_Nodes_Stddev_Pop_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Zone_Nodes_Stddev_Samp_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "zone_nodes" */
export type Zone_Nodes_Stddev_Samp_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Zone_Nodes_Sum_Fields = {
  connection_duration?: Maybe<Scalars['bigint']>;
  earliest_block_height?: Maybe<Scalars['Int']>;
  last_block_height?: Maybe<Scalars['Int']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "zone_nodes" */
export type Zone_Nodes_Sum_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Zone_Nodes_Var_Pop_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "zone_nodes" */
export type Zone_Nodes_Var_Pop_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Zone_Nodes_Var_Samp_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "zone_nodes" */
export type Zone_Nodes_Var_Samp_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Zone_Nodes_Variance_Fields = {
  connection_duration?: Maybe<Scalars['Float']>;
  earliest_block_height?: Maybe<Scalars['Float']>;
  last_block_height?: Maybe<Scalars['Float']>;
  location_lat?: Maybe<Scalars['Float']>;
  location_lon?: Maybe<Scalars['Float']>;
  location_timezone_offset?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "zone_nodes" */
export type Zone_Nodes_Variance_Order_By = {
  connection_duration?: InputMaybe<Order_By>;
  earliest_block_height?: InputMaybe<Order_By>;
  last_block_height?: InputMaybe<Order_By>;
  location_lat?: InputMaybe<Order_By>;
  location_lon?: InputMaybe<Order_By>;
  location_timezone_offset?: InputMaybe<Order_By>;
};

/** columns and relationships of "zones_graphs" */
export type Zones_Graphs = {
  channels_cnt_active: Scalars['Int'];
  channels_cnt_open: Scalars['Int'];
  channels_percent_active: Scalars['numeric'];
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  is_mainnet: Scalars['Boolean'];
  source: Scalars['String'];
  source_cashflow_in?: Maybe<Scalars['bigint']>;
  source_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  source_cashflow_out?: Maybe<Scalars['bigint']>;
  source_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  source_transfers_period?: Maybe<Scalars['bigint']>;
  target: Scalars['String'];
  target_cashflow_in?: Maybe<Scalars['bigint']>;
  target_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  target_cashflow_out?: Maybe<Scalars['bigint']>;
  target_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  target_transfers_period?: Maybe<Scalars['bigint']>;
  timeframe: Scalars['Int'];
};

/** aggregated selection of "zones_graphs" */
export type Zones_Graphs_Aggregate = {
  aggregate?: Maybe<Zones_Graphs_Aggregate_Fields>;
  nodes: Array<Zones_Graphs>;
};

/** aggregate fields of "zones_graphs" */
export type Zones_Graphs_Aggregate_Fields = {
  avg?: Maybe<Zones_Graphs_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Zones_Graphs_Max_Fields>;
  min?: Maybe<Zones_Graphs_Min_Fields>;
  stddev?: Maybe<Zones_Graphs_Stddev_Fields>;
  stddev_pop?: Maybe<Zones_Graphs_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Zones_Graphs_Stddev_Samp_Fields>;
  sum?: Maybe<Zones_Graphs_Sum_Fields>;
  var_pop?: Maybe<Zones_Graphs_Var_Pop_Fields>;
  var_samp?: Maybe<Zones_Graphs_Var_Samp_Fields>;
  variance?: Maybe<Zones_Graphs_Variance_Fields>;
};

/** aggregate fields of "zones_graphs" */
export type Zones_Graphs_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Zones_Graphs_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "zones_graphs" */
export type Zones_Graphs_Aggregate_Order_By = {
  avg?: InputMaybe<Zones_Graphs_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Zones_Graphs_Max_Order_By>;
  min?: InputMaybe<Zones_Graphs_Min_Order_By>;
  stddev?: InputMaybe<Zones_Graphs_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Zones_Graphs_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Zones_Graphs_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Zones_Graphs_Sum_Order_By>;
  var_pop?: InputMaybe<Zones_Graphs_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Zones_Graphs_Var_Samp_Order_By>;
  variance?: InputMaybe<Zones_Graphs_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Zones_Graphs_Avg_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "zones_graphs" */
export type Zones_Graphs_Avg_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "zones_graphs". All fields are combined with a logical 'AND'. */
export type Zones_Graphs_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Zones_Graphs_Bool_Exp>>>;
  _not?: InputMaybe<Zones_Graphs_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Zones_Graphs_Bool_Exp>>>;
  channels_cnt_active?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_open?: InputMaybe<Int_Comparison_Exp>;
  channels_percent_active?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending?: InputMaybe<Int_Comparison_Exp>;
  is_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  source?: InputMaybe<String_Comparison_Exp>;
  source_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  source_cashflow_in_percent?: InputMaybe<Numeric_Comparison_Exp>;
  source_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  source_cashflow_out_percent?: InputMaybe<Numeric_Comparison_Exp>;
  source_transfers_period?: InputMaybe<Bigint_Comparison_Exp>;
  target?: InputMaybe<String_Comparison_Exp>;
  target_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  target_cashflow_in_percent?: InputMaybe<Numeric_Comparison_Exp>;
  target_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  target_cashflow_out_percent?: InputMaybe<Numeric_Comparison_Exp>;
  target_transfers_period?: InputMaybe<Bigint_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
};

/** aggregate max on columns */
export type Zones_Graphs_Max_Fields = {
  channels_cnt_active?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_percent_active?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
  source_cashflow_in?: Maybe<Scalars['bigint']>;
  source_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  source_cashflow_out?: Maybe<Scalars['bigint']>;
  source_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  source_transfers_period?: Maybe<Scalars['bigint']>;
  target?: Maybe<Scalars['String']>;
  target_cashflow_in?: Maybe<Scalars['bigint']>;
  target_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  target_cashflow_out?: Maybe<Scalars['bigint']>;
  target_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  target_transfers_period?: Maybe<Scalars['bigint']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by max() on columns of table "zones_graphs" */
export type Zones_Graphs_Max_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Zones_Graphs_Min_Fields = {
  channels_cnt_active?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_percent_active?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
  source_cashflow_in?: Maybe<Scalars['bigint']>;
  source_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  source_cashflow_out?: Maybe<Scalars['bigint']>;
  source_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  source_transfers_period?: Maybe<Scalars['bigint']>;
  target?: Maybe<Scalars['String']>;
  target_cashflow_in?: Maybe<Scalars['bigint']>;
  target_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  target_cashflow_out?: Maybe<Scalars['bigint']>;
  target_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  target_transfers_period?: Maybe<Scalars['bigint']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by min() on columns of table "zones_graphs" */
export type Zones_Graphs_Min_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "zones_graphs" */
export type Zones_Graphs_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  is_mainnet?: InputMaybe<Order_By>;
  source?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "zones_graphs" */
export type Zones_Graphs_Pk_Columns_Input = {
  source: Scalars['String'];
  target: Scalars['String'];
  timeframe: Scalars['Int'];
};

/** select columns of table "zones_graphs" */
export const enum Zones_Graphs_Select_Column {
  /** column name */
  ChannelsCntActive = 'channels_cnt_active',
  /** column name */
  ChannelsCntOpen = 'channels_cnt_open',
  /** column name */
  ChannelsPercentActive = 'channels_percent_active',
  /** column name */
  IbcCashflow = 'ibc_cashflow',
  /** column name */
  IbcCashflowPending = 'ibc_cashflow_pending',
  /** column name */
  IbcTransfers = 'ibc_transfers',
  /** column name */
  IbcTransfersPending = 'ibc_transfers_pending',
  /** column name */
  IsMainnet = 'is_mainnet',
  /** column name */
  Source = 'source',
  /** column name */
  SourceCashflowIn = 'source_cashflow_in',
  /** column name */
  SourceCashflowInPercent = 'source_cashflow_in_percent',
  /** column name */
  SourceCashflowOut = 'source_cashflow_out',
  /** column name */
  SourceCashflowOutPercent = 'source_cashflow_out_percent',
  /** column name */
  SourceTransfersPeriod = 'source_transfers_period',
  /** column name */
  Target = 'target',
  /** column name */
  TargetCashflowIn = 'target_cashflow_in',
  /** column name */
  TargetCashflowInPercent = 'target_cashflow_in_percent',
  /** column name */
  TargetCashflowOut = 'target_cashflow_out',
  /** column name */
  TargetCashflowOutPercent = 'target_cashflow_out_percent',
  /** column name */
  TargetTransfersPeriod = 'target_transfers_period',
  /** column name */
  Timeframe = 'timeframe',
}

/** aggregate stddev on columns */
export type Zones_Graphs_Stddev_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "zones_graphs" */
export type Zones_Graphs_Stddev_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Zones_Graphs_Stddev_Pop_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "zones_graphs" */
export type Zones_Graphs_Stddev_Pop_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Zones_Graphs_Stddev_Samp_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "zones_graphs" */
export type Zones_Graphs_Stddev_Samp_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Zones_Graphs_Sum_Fields = {
  channels_cnt_active?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_percent_active?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  source_cashflow_in?: Maybe<Scalars['bigint']>;
  source_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  source_cashflow_out?: Maybe<Scalars['bigint']>;
  source_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  source_transfers_period?: Maybe<Scalars['bigint']>;
  target_cashflow_in?: Maybe<Scalars['bigint']>;
  target_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  target_cashflow_out?: Maybe<Scalars['bigint']>;
  target_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  target_transfers_period?: Maybe<Scalars['bigint']>;
  timeframe?: Maybe<Scalars['Int']>;
};

/** order by sum() on columns of table "zones_graphs" */
export type Zones_Graphs_Sum_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Zones_Graphs_Var_Pop_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "zones_graphs" */
export type Zones_Graphs_Var_Pop_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Zones_Graphs_Var_Samp_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "zones_graphs" */
export type Zones_Graphs_Var_Samp_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Zones_Graphs_Variance_Fields = {
  channels_cnt_active?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_percent_active?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  source_cashflow_in?: Maybe<Scalars['Float']>;
  source_cashflow_in_percent?: Maybe<Scalars['Float']>;
  source_cashflow_out?: Maybe<Scalars['Float']>;
  source_cashflow_out_percent?: Maybe<Scalars['Float']>;
  source_transfers_period?: Maybe<Scalars['Float']>;
  target_cashflow_in?: Maybe<Scalars['Float']>;
  target_cashflow_in_percent?: Maybe<Scalars['Float']>;
  target_cashflow_out?: Maybe<Scalars['Float']>;
  target_cashflow_out_percent?: Maybe<Scalars['Float']>;
  target_transfers_period?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "zones_graphs" */
export type Zones_Graphs_Variance_Order_By = {
  channels_cnt_active?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_percent_active?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  source_cashflow_in?: InputMaybe<Order_By>;
  source_cashflow_in_percent?: InputMaybe<Order_By>;
  source_cashflow_out?: InputMaybe<Order_By>;
  source_cashflow_out_percent?: InputMaybe<Order_By>;
  source_transfers_period?: InputMaybe<Order_By>;
  target_cashflow_in?: InputMaybe<Order_By>;
  target_cashflow_in_percent?: InputMaybe<Order_By>;
  target_cashflow_out?: InputMaybe<Order_By>;
  target_cashflow_out_percent?: InputMaybe<Order_By>;
  target_transfers_period?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
};

/** columns and relationships of "zones_stats" */
export type Zones_Stats = {
  channels_cnt_active_period: Scalars['Int'];
  channels_cnt_active_period_diff: Scalars['Int'];
  channels_cnt_open: Scalars['Int'];
  channels_num?: Maybe<Scalars['Int']>;
  channels_percent_active_period: Scalars['Int'];
  channels_percent_active_period_diff: Scalars['Int'];
  chart: Scalars['jsonb'];
  chart_cashflow?: Maybe<Scalars['jsonb']>;
  ibc_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_pending: Scalars['bigint'];
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_pending: Scalars['bigint'];
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_pending: Scalars['bigint'];
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_weight?: Maybe<Scalars['numeric']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_peers_mainnet?: Maybe<Scalars['Int']>;
  ibc_percent?: Maybe<Scalars['numeric']>;
  ibc_transfers: Scalars['Int'];
  ibc_transfers_diff: Scalars['Int'];
  ibc_transfers_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_transfers_pending: Scalars['Int'];
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_failed: Scalars['Int'];
  ibc_tx_failed_diff: Scalars['Int'];
  ibc_tx_in: Scalars['Int'];
  ibc_tx_in_diff: Scalars['Int'];
  ibc_tx_in_failed: Scalars['Int'];
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_in_rating: Scalars['Int'];
  ibc_tx_in_rating_diff: Scalars['Int'];
  ibc_tx_in_weight: Scalars['numeric'];
  ibc_tx_out: Scalars['Int'];
  ibc_tx_out_diff: Scalars['Int'];
  ibc_tx_out_failed: Scalars['Int'];
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out_rating: Scalars['Int'];
  ibc_tx_out_rating_diff: Scalars['Int'];
  ibc_tx_out_weight: Scalars['numeric'];
  is_zone_mainnet: Scalars['Boolean'];
  is_zone_new: Scalars['Boolean'];
  is_zone_up_to_date?: Maybe<Scalars['Boolean']>;
  relations_cnt_open: Scalars['Int'];
  success_rate?: Maybe<Scalars['numeric']>;
  success_rate_mainnet?: Maybe<Scalars['numeric']>;
  timeframe: Scalars['Int'];
  total_active_addresses?: Maybe<Scalars['Int']>;
  total_active_addresses_diff: Scalars['Int'];
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_active_addresses_rating: Scalars['Int'];
  total_active_addresses_rating_diff: Scalars['Int'];
  total_active_addresses_weight: Scalars['numeric'];
  total_coin_turnover_amount: Scalars['numeric'];
  total_coin_turnover_amount_diff: Scalars['numeric'];
  total_ibc_txs: Scalars['Int'];
  total_ibc_txs_diff: Scalars['Int'];
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_ibc_txs_rating: Scalars['Int'];
  total_ibc_txs_rating_diff: Scalars['Int'];
  total_ibc_txs_weight: Scalars['numeric'];
  total_txs?: Maybe<Scalars['Int']>;
  total_txs_diff: Scalars['Int'];
  total_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_txs_rating: Scalars['Int'];
  total_txs_rating_diff: Scalars['Int'];
  total_txs_weight: Scalars['numeric'];
  website?: Maybe<Scalars['String']>;
  zone: Scalars['String'];
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name: Scalars['String'];
};

/** columns and relationships of "zones_stats" */
export type Zones_StatsChartArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "zones_stats" */
export type Zones_StatsChart_CashflowArgs = {
  path?: InputMaybe<Scalars['String']>;
};

/** aggregated selection of "zones_stats" */
export type Zones_Stats_Aggregate = {
  aggregate?: Maybe<Zones_Stats_Aggregate_Fields>;
  nodes: Array<Zones_Stats>;
};

/** aggregate fields of "zones_stats" */
export type Zones_Stats_Aggregate_Fields = {
  avg?: Maybe<Zones_Stats_Avg_Fields>;
  count?: Maybe<Scalars['Int']>;
  max?: Maybe<Zones_Stats_Max_Fields>;
  min?: Maybe<Zones_Stats_Min_Fields>;
  stddev?: Maybe<Zones_Stats_Stddev_Fields>;
  stddev_pop?: Maybe<Zones_Stats_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Zones_Stats_Stddev_Samp_Fields>;
  sum?: Maybe<Zones_Stats_Sum_Fields>;
  var_pop?: Maybe<Zones_Stats_Var_Pop_Fields>;
  var_samp?: Maybe<Zones_Stats_Var_Samp_Fields>;
  variance?: Maybe<Zones_Stats_Variance_Fields>;
};

/** aggregate fields of "zones_stats" */
export type Zones_Stats_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Zones_Stats_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** order by aggregate values of table "zones_stats" */
export type Zones_Stats_Aggregate_Order_By = {
  avg?: InputMaybe<Zones_Stats_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Zones_Stats_Max_Order_By>;
  min?: InputMaybe<Zones_Stats_Min_Order_By>;
  stddev?: InputMaybe<Zones_Stats_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Zones_Stats_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Zones_Stats_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Zones_Stats_Sum_Order_By>;
  var_pop?: InputMaybe<Zones_Stats_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Zones_Stats_Var_Samp_Order_By>;
  variance?: InputMaybe<Zones_Stats_Variance_Order_By>;
};

/** aggregate avg on columns */
export type Zones_Stats_Avg_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by avg() on columns of table "zones_stats" */
export type Zones_Stats_Avg_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "zones_stats". All fields are combined with a logical 'AND'. */
export type Zones_Stats_Bool_Exp = {
  _and?: InputMaybe<Array<InputMaybe<Zones_Stats_Bool_Exp>>>;
  _not?: InputMaybe<Zones_Stats_Bool_Exp>;
  _or?: InputMaybe<Array<InputMaybe<Zones_Stats_Bool_Exp>>>;
  channels_cnt_active_period?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_active_period_diff?: InputMaybe<Int_Comparison_Exp>;
  channels_cnt_open?: InputMaybe<Int_Comparison_Exp>;
  channels_num?: InputMaybe<Int_Comparison_Exp>;
  channels_percent_active_period?: InputMaybe<Int_Comparison_Exp>;
  channels_percent_active_period_diff?: InputMaybe<Int_Comparison_Exp>;
  chart?: InputMaybe<Jsonb_Comparison_Exp>;
  chart_cashflow?: InputMaybe<Jsonb_Comparison_Exp>;
  ibc_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_mainnet?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_active_addresses_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_active_addresses_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_in_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_in_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_in_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_in_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_out?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_out_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_out_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_out_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_out_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_cashflow_pending?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Bigint_Comparison_Exp>;
  ibc_cashflow_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_cashflow_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_peers?: InputMaybe<Int_Comparison_Exp>;
  ibc_peers_mainnet?: InputMaybe<Int_Comparison_Exp>;
  ibc_percent?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_transfers?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_mainnet?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_mainnet_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_transfers_pending?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_pending_mainnet?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_transfers_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_failed_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_in_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_in_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_out?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_failed?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  ibc_tx_out_rating?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  ibc_tx_out_weight?: InputMaybe<Numeric_Comparison_Exp>;
  is_zone_mainnet?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_new?: InputMaybe<Boolean_Comparison_Exp>;
  is_zone_up_to_date?: InputMaybe<Boolean_Comparison_Exp>;
  relations_cnt_open?: InputMaybe<Int_Comparison_Exp>;
  success_rate?: InputMaybe<Numeric_Comparison_Exp>;
  success_rate_mainnet?: InputMaybe<Numeric_Comparison_Exp>;
  timeframe?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_diff?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  total_active_addresses_rating?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_active_addresses_weight?: InputMaybe<Numeric_Comparison_Exp>;
  total_coin_turnover_amount?: InputMaybe<Numeric_Comparison_Exp>;
  total_coin_turnover_amount_diff?: InputMaybe<Numeric_Comparison_Exp>;
  total_ibc_txs?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_diff?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  total_ibc_txs_rating?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_ibc_txs_weight?: InputMaybe<Numeric_Comparison_Exp>;
  total_txs?: InputMaybe<Int_Comparison_Exp>;
  total_txs_diff?: InputMaybe<Int_Comparison_Exp>;
  total_txs_mainnet_rating?: InputMaybe<Int_Comparison_Exp>;
  total_txs_mainnet_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_txs_mainnet_weight?: InputMaybe<Numeric_Comparison_Exp>;
  total_txs_rating?: InputMaybe<Int_Comparison_Exp>;
  total_txs_rating_diff?: InputMaybe<Int_Comparison_Exp>;
  total_txs_weight?: InputMaybe<Numeric_Comparison_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
  zone?: InputMaybe<String_Comparison_Exp>;
  zone_label_url?: InputMaybe<String_Comparison_Exp>;
  zone_label_url2?: InputMaybe<String_Comparison_Exp>;
  zone_readable_name?: InputMaybe<String_Comparison_Exp>;
};

/** aggregate max on columns */
export type Zones_Stats_Max_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_num?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_weight?: Maybe<Scalars['numeric']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_peers_mainnet?: Maybe<Scalars['Int']>;
  ibc_percent?: Maybe<Scalars['numeric']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_failed?: Maybe<Scalars['Int']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in?: Maybe<Scalars['Int']>;
  ibc_tx_in_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_failed?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_in_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out?: Maybe<Scalars['Int']>;
  ibc_tx_out_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_failed?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_weight?: Maybe<Scalars['numeric']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  success_rate?: Maybe<Scalars['numeric']>;
  success_rate_mainnet?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  total_active_addresses?: Maybe<Scalars['Int']>;
  total_active_addresses_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_active_addresses_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_weight?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['numeric']>;
  total_ibc_txs?: Maybe<Scalars['Int']>;
  total_ibc_txs_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_ibc_txs_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_weight?: Maybe<Scalars['numeric']>;
  total_txs?: Maybe<Scalars['Int']>;
  total_txs_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_txs_rating?: Maybe<Scalars['Int']>;
  total_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_weight?: Maybe<Scalars['numeric']>;
  website?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by max() on columns of table "zones_stats" */
export type Zones_Stats_Max_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Zones_Stats_Min_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_num?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_weight?: Maybe<Scalars['numeric']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_peers_mainnet?: Maybe<Scalars['Int']>;
  ibc_percent?: Maybe<Scalars['numeric']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_failed?: Maybe<Scalars['Int']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in?: Maybe<Scalars['Int']>;
  ibc_tx_in_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_failed?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_in_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out?: Maybe<Scalars['Int']>;
  ibc_tx_out_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_failed?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_weight?: Maybe<Scalars['numeric']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  success_rate?: Maybe<Scalars['numeric']>;
  success_rate_mainnet?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  total_active_addresses?: Maybe<Scalars['Int']>;
  total_active_addresses_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_active_addresses_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_weight?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['numeric']>;
  total_ibc_txs?: Maybe<Scalars['Int']>;
  total_ibc_txs_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_ibc_txs_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_weight?: Maybe<Scalars['numeric']>;
  total_txs?: Maybe<Scalars['Int']>;
  total_txs_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_txs_rating?: Maybe<Scalars['Int']>;
  total_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_weight?: Maybe<Scalars['numeric']>;
  website?: Maybe<Scalars['String']>;
  zone?: Maybe<Scalars['String']>;
  zone_label_url?: Maybe<Scalars['String']>;
  zone_label_url2?: Maybe<Scalars['String']>;
  zone_readable_name?: Maybe<Scalars['String']>;
};

/** order by min() on columns of table "zones_stats" */
export type Zones_Stats_Min_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** ordering options when selecting data from "zones_stats" */
export type Zones_Stats_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  chart?: InputMaybe<Order_By>;
  chart_cashflow?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  is_zone_mainnet?: InputMaybe<Order_By>;
  is_zone_new?: InputMaybe<Order_By>;
  is_zone_up_to_date?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
  zone?: InputMaybe<Order_By>;
  zone_label_url?: InputMaybe<Order_By>;
  zone_label_url2?: InputMaybe<Order_By>;
  zone_readable_name?: InputMaybe<Order_By>;
};

/** primary key columns input for table: "zones_stats" */
export type Zones_Stats_Pk_Columns_Input = {
  timeframe: Scalars['Int'];
  zone: Scalars['String'];
};

/** select columns of table "zones_stats" */
export const enum Zones_Stats_Select_Column {
  /** column name */
  ChannelsCntActivePeriod = 'channels_cnt_active_period',
  /** column name */
  ChannelsCntActivePeriodDiff = 'channels_cnt_active_period_diff',
  /** column name */
  ChannelsCntOpen = 'channels_cnt_open',
  /** column name */
  ChannelsNum = 'channels_num',
  /** column name */
  ChannelsPercentActivePeriod = 'channels_percent_active_period',
  /** column name */
  ChannelsPercentActivePeriodDiff = 'channels_percent_active_period_diff',
  /** column name */
  Chart = 'chart',
  /** column name */
  ChartCashflow = 'chart_cashflow',
  /** column name */
  IbcActiveAddresses = 'ibc_active_addresses',
  /** column name */
  IbcActiveAddressesDiff = 'ibc_active_addresses_diff',
  /** column name */
  IbcActiveAddressesMainnet = 'ibc_active_addresses_mainnet',
  /** column name */
  IbcActiveAddressesMainnetDiff = 'ibc_active_addresses_mainnet_diff',
  /** column name */
  IbcActiveAddressesMainnetRating = 'ibc_active_addresses_mainnet_rating',
  /** column name */
  IbcActiveAddressesMainnetRatingDiff = 'ibc_active_addresses_mainnet_rating_diff',
  /** column name */
  IbcActiveAddressesMainnetWeight = 'ibc_active_addresses_mainnet_weight',
  /** column name */
  IbcActiveAddressesRating = 'ibc_active_addresses_rating',
  /** column name */
  IbcActiveAddressesRatingDiff = 'ibc_active_addresses_rating_diff',
  /** column name */
  IbcActiveAddressesWeight = 'ibc_active_addresses_weight',
  /** column name */
  IbcCashflow = 'ibc_cashflow',
  /** column name */
  IbcCashflowDiff = 'ibc_cashflow_diff',
  /** column name */
  IbcCashflowIn = 'ibc_cashflow_in',
  /** column name */
  IbcCashflowInDiff = 'ibc_cashflow_in_diff',
  /** column name */
  IbcCashflowInMainnet = 'ibc_cashflow_in_mainnet',
  /** column name */
  IbcCashflowInMainnetDiff = 'ibc_cashflow_in_mainnet_diff',
  /** column name */
  IbcCashflowInMainnetRating = 'ibc_cashflow_in_mainnet_rating',
  /** column name */
  IbcCashflowInMainnetRatingDiff = 'ibc_cashflow_in_mainnet_rating_diff',
  /** column name */
  IbcCashflowInMainnetWeight = 'ibc_cashflow_in_mainnet_weight',
  /** column name */
  IbcCashflowInPending = 'ibc_cashflow_in_pending',
  /** column name */
  IbcCashflowInPendingMainnet = 'ibc_cashflow_in_pending_mainnet',
  /** column name */
  IbcCashflowInPercent = 'ibc_cashflow_in_percent',
  /** column name */
  IbcCashflowInPercentMainnet = 'ibc_cashflow_in_percent_mainnet',
  /** column name */
  IbcCashflowInRating = 'ibc_cashflow_in_rating',
  /** column name */
  IbcCashflowInRatingDiff = 'ibc_cashflow_in_rating_diff',
  /** column name */
  IbcCashflowInWeight = 'ibc_cashflow_in_weight',
  /** column name */
  IbcCashflowMainnet = 'ibc_cashflow_mainnet',
  /** column name */
  IbcCashflowMainnetDiff = 'ibc_cashflow_mainnet_diff',
  /** column name */
  IbcCashflowMainnetRating = 'ibc_cashflow_mainnet_rating',
  /** column name */
  IbcCashflowMainnetRatingDiff = 'ibc_cashflow_mainnet_rating_diff',
  /** column name */
  IbcCashflowMainnetWeight = 'ibc_cashflow_mainnet_weight',
  /** column name */
  IbcCashflowOut = 'ibc_cashflow_out',
  /** column name */
  IbcCashflowOutDiff = 'ibc_cashflow_out_diff',
  /** column name */
  IbcCashflowOutMainnet = 'ibc_cashflow_out_mainnet',
  /** column name */
  IbcCashflowOutMainnetDiff = 'ibc_cashflow_out_mainnet_diff',
  /** column name */
  IbcCashflowOutMainnetRating = 'ibc_cashflow_out_mainnet_rating',
  /** column name */
  IbcCashflowOutMainnetRatingDiff = 'ibc_cashflow_out_mainnet_rating_diff',
  /** column name */
  IbcCashflowOutMainnetWeight = 'ibc_cashflow_out_mainnet_weight',
  /** column name */
  IbcCashflowOutPending = 'ibc_cashflow_out_pending',
  /** column name */
  IbcCashflowOutPendingMainnet = 'ibc_cashflow_out_pending_mainnet',
  /** column name */
  IbcCashflowOutPercent = 'ibc_cashflow_out_percent',
  /** column name */
  IbcCashflowOutPercentMainnet = 'ibc_cashflow_out_percent_mainnet',
  /** column name */
  IbcCashflowOutRating = 'ibc_cashflow_out_rating',
  /** column name */
  IbcCashflowOutRatingDiff = 'ibc_cashflow_out_rating_diff',
  /** column name */
  IbcCashflowOutWeight = 'ibc_cashflow_out_weight',
  /** column name */
  IbcCashflowPending = 'ibc_cashflow_pending',
  /** column name */
  IbcCashflowPendingMainnet = 'ibc_cashflow_pending_mainnet',
  /** column name */
  IbcCashflowRating = 'ibc_cashflow_rating',
  /** column name */
  IbcCashflowRatingDiff = 'ibc_cashflow_rating_diff',
  /** column name */
  IbcCashflowWeight = 'ibc_cashflow_weight',
  /** column name */
  IbcPeers = 'ibc_peers',
  /** column name */
  IbcPeersMainnet = 'ibc_peers_mainnet',
  /** column name */
  IbcPercent = 'ibc_percent',
  /** column name */
  IbcTransfers = 'ibc_transfers',
  /** column name */
  IbcTransfersDiff = 'ibc_transfers_diff',
  /** column name */
  IbcTransfersMainnet = 'ibc_transfers_mainnet',
  /** column name */
  IbcTransfersMainnetDiff = 'ibc_transfers_mainnet_diff',
  /** column name */
  IbcTransfersMainnetRating = 'ibc_transfers_mainnet_rating',
  /** column name */
  IbcTransfersMainnetRatingDiff = 'ibc_transfers_mainnet_rating_diff',
  /** column name */
  IbcTransfersMainnetWeight = 'ibc_transfers_mainnet_weight',
  /** column name */
  IbcTransfersPending = 'ibc_transfers_pending',
  /** column name */
  IbcTransfersPendingMainnet = 'ibc_transfers_pending_mainnet',
  /** column name */
  IbcTransfersRating = 'ibc_transfers_rating',
  /** column name */
  IbcTransfersRatingDiff = 'ibc_transfers_rating_diff',
  /** column name */
  IbcTransfersWeight = 'ibc_transfers_weight',
  /** column name */
  IbcTxFailed = 'ibc_tx_failed',
  /** column name */
  IbcTxFailedDiff = 'ibc_tx_failed_diff',
  /** column name */
  IbcTxIn = 'ibc_tx_in',
  /** column name */
  IbcTxInDiff = 'ibc_tx_in_diff',
  /** column name */
  IbcTxInFailed = 'ibc_tx_in_failed',
  /** column name */
  IbcTxInMainnetRating = 'ibc_tx_in_mainnet_rating',
  /** column name */
  IbcTxInMainnetRatingDiff = 'ibc_tx_in_mainnet_rating_diff',
  /** column name */
  IbcTxInMainnetWeight = 'ibc_tx_in_mainnet_weight',
  /** column name */
  IbcTxInRating = 'ibc_tx_in_rating',
  /** column name */
  IbcTxInRatingDiff = 'ibc_tx_in_rating_diff',
  /** column name */
  IbcTxInWeight = 'ibc_tx_in_weight',
  /** column name */
  IbcTxOut = 'ibc_tx_out',
  /** column name */
  IbcTxOutDiff = 'ibc_tx_out_diff',
  /** column name */
  IbcTxOutFailed = 'ibc_tx_out_failed',
  /** column name */
  IbcTxOutMainnetRating = 'ibc_tx_out_mainnet_rating',
  /** column name */
  IbcTxOutMainnetRatingDiff = 'ibc_tx_out_mainnet_rating_diff',
  /** column name */
  IbcTxOutMainnetWeight = 'ibc_tx_out_mainnet_weight',
  /** column name */
  IbcTxOutRating = 'ibc_tx_out_rating',
  /** column name */
  IbcTxOutRatingDiff = 'ibc_tx_out_rating_diff',
  /** column name */
  IbcTxOutWeight = 'ibc_tx_out_weight',
  /** column name */
  IsZoneMainnet = 'is_zone_mainnet',
  /** column name */
  IsZoneNew = 'is_zone_new',
  /** column name */
  IsZoneUpToDate = 'is_zone_up_to_date',
  /** column name */
  RelationsCntOpen = 'relations_cnt_open',
  /** column name */
  SuccessRate = 'success_rate',
  /** column name */
  SuccessRateMainnet = 'success_rate_mainnet',
  /** column name */
  Timeframe = 'timeframe',
  /** column name */
  TotalActiveAddresses = 'total_active_addresses',
  /** column name */
  TotalActiveAddressesDiff = 'total_active_addresses_diff',
  /** column name */
  TotalActiveAddressesMainnetRating = 'total_active_addresses_mainnet_rating',
  /** column name */
  TotalActiveAddressesMainnetRatingDiff = 'total_active_addresses_mainnet_rating_diff',
  /** column name */
  TotalActiveAddressesMainnetWeight = 'total_active_addresses_mainnet_weight',
  /** column name */
  TotalActiveAddressesRating = 'total_active_addresses_rating',
  /** column name */
  TotalActiveAddressesRatingDiff = 'total_active_addresses_rating_diff',
  /** column name */
  TotalActiveAddressesWeight = 'total_active_addresses_weight',
  /** column name */
  TotalCoinTurnoverAmount = 'total_coin_turnover_amount',
  /** column name */
  TotalCoinTurnoverAmountDiff = 'total_coin_turnover_amount_diff',
  /** column name */
  TotalIbcTxs = 'total_ibc_txs',
  /** column name */
  TotalIbcTxsDiff = 'total_ibc_txs_diff',
  /** column name */
  TotalIbcTxsMainnetRating = 'total_ibc_txs_mainnet_rating',
  /** column name */
  TotalIbcTxsMainnetRatingDiff = 'total_ibc_txs_mainnet_rating_diff',
  /** column name */
  TotalIbcTxsMainnetWeight = 'total_ibc_txs_mainnet_weight',
  /** column name */
  TotalIbcTxsRating = 'total_ibc_txs_rating',
  /** column name */
  TotalIbcTxsRatingDiff = 'total_ibc_txs_rating_diff',
  /** column name */
  TotalIbcTxsWeight = 'total_ibc_txs_weight',
  /** column name */
  TotalTxs = 'total_txs',
  /** column name */
  TotalTxsDiff = 'total_txs_diff',
  /** column name */
  TotalTxsMainnetRating = 'total_txs_mainnet_rating',
  /** column name */
  TotalTxsMainnetRatingDiff = 'total_txs_mainnet_rating_diff',
  /** column name */
  TotalTxsMainnetWeight = 'total_txs_mainnet_weight',
  /** column name */
  TotalTxsRating = 'total_txs_rating',
  /** column name */
  TotalTxsRatingDiff = 'total_txs_rating_diff',
  /** column name */
  TotalTxsWeight = 'total_txs_weight',
  /** column name */
  Website = 'website',
  /** column name */
  Zone = 'zone',
  /** column name */
  ZoneLabelUrl = 'zone_label_url',
  /** column name */
  ZoneLabelUrl2 = 'zone_label_url2',
  /** column name */
  ZoneReadableName = 'zone_readable_name',
}

/** aggregate stddev on columns */
export type Zones_Stats_Stddev_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by stddev() on columns of table "zones_stats" */
export type Zones_Stats_Stddev_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Zones_Stats_Stddev_Pop_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by stddev_pop() on columns of table "zones_stats" */
export type Zones_Stats_Stddev_Pop_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Zones_Stats_Stddev_Samp_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by stddev_samp() on columns of table "zones_stats" */
export type Zones_Stats_Stddev_Samp_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate sum on columns */
export type Zones_Stats_Sum_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Int']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Int']>;
  channels_cnt_open?: Maybe<Scalars['Int']>;
  channels_num?: Maybe<Scalars['Int']>;
  channels_percent_active_period?: Maybe<Scalars['Int']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses?: Maybe<Scalars['Int']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Int']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  ibc_active_addresses_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow?: Maybe<Scalars['bigint']>;
  ibc_cashflow_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['numeric']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['numeric']>;
  ibc_cashflow_pending?: Maybe<Scalars['bigint']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['bigint']>;
  ibc_cashflow_rating?: Maybe<Scalars['Int']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Int']>;
  ibc_cashflow_weight?: Maybe<Scalars['numeric']>;
  ibc_peers?: Maybe<Scalars['Int']>;
  ibc_peers_mainnet?: Maybe<Scalars['Int']>;
  ibc_percent?: Maybe<Scalars['numeric']>;
  ibc_transfers?: Maybe<Scalars['Int']>;
  ibc_transfers_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_transfers_pending?: Maybe<Scalars['Int']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Int']>;
  ibc_transfers_rating?: Maybe<Scalars['Int']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Int']>;
  ibc_transfers_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_failed?: Maybe<Scalars['Int']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in?: Maybe<Scalars['Int']>;
  ibc_tx_in_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_failed?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_in_rating?: Maybe<Scalars['Int']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_in_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out?: Maybe<Scalars['Int']>;
  ibc_tx_out_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_failed?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['numeric']>;
  ibc_tx_out_rating?: Maybe<Scalars['Int']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Int']>;
  ibc_tx_out_weight?: Maybe<Scalars['numeric']>;
  relations_cnt_open?: Maybe<Scalars['Int']>;
  success_rate?: Maybe<Scalars['numeric']>;
  success_rate_mainnet?: Maybe<Scalars['numeric']>;
  timeframe?: Maybe<Scalars['Int']>;
  total_active_addresses?: Maybe<Scalars['Int']>;
  total_active_addresses_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_active_addresses_rating?: Maybe<Scalars['Int']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Int']>;
  total_active_addresses_weight?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount?: Maybe<Scalars['numeric']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['numeric']>;
  total_ibc_txs?: Maybe<Scalars['Int']>;
  total_ibc_txs_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_ibc_txs_rating?: Maybe<Scalars['Int']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_ibc_txs_weight?: Maybe<Scalars['numeric']>;
  total_txs?: Maybe<Scalars['Int']>;
  total_txs_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Int']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_mainnet_weight?: Maybe<Scalars['numeric']>;
  total_txs_rating?: Maybe<Scalars['Int']>;
  total_txs_rating_diff?: Maybe<Scalars['Int']>;
  total_txs_weight?: Maybe<Scalars['numeric']>;
};

/** order by sum() on columns of table "zones_stats" */
export type Zones_Stats_Sum_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Zones_Stats_Var_Pop_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by var_pop() on columns of table "zones_stats" */
export type Zones_Stats_Var_Pop_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Zones_Stats_Var_Samp_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by var_samp() on columns of table "zones_stats" */
export type Zones_Stats_Var_Samp_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Zones_Stats_Variance_Fields = {
  channels_cnt_active_period?: Maybe<Scalars['Float']>;
  channels_cnt_active_period_diff?: Maybe<Scalars['Float']>;
  channels_cnt_open?: Maybe<Scalars['Float']>;
  channels_num?: Maybe<Scalars['Float']>;
  channels_percent_active_period?: Maybe<Scalars['Float']>;
  channels_percent_active_period_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses?: Maybe<Scalars['Float']>;
  ibc_active_addresses_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating?: Maybe<Scalars['Float']>;
  ibc_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  ibc_active_addresses_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow?: Maybe<Scalars['Float']>;
  ibc_cashflow_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_in_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_percent_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_out_weight?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending?: Maybe<Scalars['Float']>;
  ibc_cashflow_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating?: Maybe<Scalars['Float']>;
  ibc_cashflow_rating_diff?: Maybe<Scalars['Float']>;
  ibc_cashflow_weight?: Maybe<Scalars['Float']>;
  ibc_peers?: Maybe<Scalars['Float']>;
  ibc_peers_mainnet?: Maybe<Scalars['Float']>;
  ibc_percent?: Maybe<Scalars['Float']>;
  ibc_transfers?: Maybe<Scalars['Float']>;
  ibc_transfers_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_transfers_pending?: Maybe<Scalars['Float']>;
  ibc_transfers_pending_mainnet?: Maybe<Scalars['Float']>;
  ibc_transfers_rating?: Maybe<Scalars['Float']>;
  ibc_transfers_rating_diff?: Maybe<Scalars['Float']>;
  ibc_transfers_weight?: Maybe<Scalars['Float']>;
  ibc_tx_failed?: Maybe<Scalars['Float']>;
  ibc_tx_failed_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in?: Maybe<Scalars['Float']>;
  ibc_tx_in_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_failed?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating?: Maybe<Scalars['Float']>;
  ibc_tx_in_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_in_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out?: Maybe<Scalars['Float']>;
  ibc_tx_out_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_failed?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_mainnet_weight?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating?: Maybe<Scalars['Float']>;
  ibc_tx_out_rating_diff?: Maybe<Scalars['Float']>;
  ibc_tx_out_weight?: Maybe<Scalars['Float']>;
  relations_cnt_open?: Maybe<Scalars['Float']>;
  success_rate?: Maybe<Scalars['Float']>;
  success_rate_mainnet?: Maybe<Scalars['Float']>;
  timeframe?: Maybe<Scalars['Float']>;
  total_active_addresses?: Maybe<Scalars['Float']>;
  total_active_addresses_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_mainnet_weight?: Maybe<Scalars['Float']>;
  total_active_addresses_rating?: Maybe<Scalars['Float']>;
  total_active_addresses_rating_diff?: Maybe<Scalars['Float']>;
  total_active_addresses_weight?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount?: Maybe<Scalars['Float']>;
  total_coin_turnover_amount_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs?: Maybe<Scalars['Float']>;
  total_ibc_txs_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating?: Maybe<Scalars['Float']>;
  total_ibc_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_ibc_txs_weight?: Maybe<Scalars['Float']>;
  total_txs?: Maybe<Scalars['Float']>;
  total_txs_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating?: Maybe<Scalars['Float']>;
  total_txs_mainnet_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_mainnet_weight?: Maybe<Scalars['Float']>;
  total_txs_rating?: Maybe<Scalars['Float']>;
  total_txs_rating_diff?: Maybe<Scalars['Float']>;
  total_txs_weight?: Maybe<Scalars['Float']>;
};

/** order by variance() on columns of table "zones_stats" */
export type Zones_Stats_Variance_Order_By = {
  channels_cnt_active_period?: InputMaybe<Order_By>;
  channels_cnt_active_period_diff?: InputMaybe<Order_By>;
  channels_cnt_open?: InputMaybe<Order_By>;
  channels_num?: InputMaybe<Order_By>;
  channels_percent_active_period?: InputMaybe<Order_By>;
  channels_percent_active_period_diff?: InputMaybe<Order_By>;
  ibc_active_addresses?: InputMaybe<Order_By>;
  ibc_active_addresses_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  ibc_active_addresses_rating?: InputMaybe<Order_By>;
  ibc_active_addresses_rating_diff?: InputMaybe<Order_By>;
  ibc_active_addresses_weight?: InputMaybe<Order_By>;
  ibc_cashflow?: InputMaybe<Order_By>;
  ibc_cashflow_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in?: InputMaybe<Order_By>;
  ibc_cashflow_in_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending?: InputMaybe<Order_By>;
  ibc_cashflow_in_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent?: InputMaybe<Order_By>;
  ibc_cashflow_in_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating?: InputMaybe<Order_By>;
  ibc_cashflow_in_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_in_weight?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out?: InputMaybe<Order_By>;
  ibc_cashflow_out_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending?: InputMaybe<Order_By>;
  ibc_cashflow_out_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent?: InputMaybe<Order_By>;
  ibc_cashflow_out_percent_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating?: InputMaybe<Order_By>;
  ibc_cashflow_out_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_out_weight?: InputMaybe<Order_By>;
  ibc_cashflow_pending?: InputMaybe<Order_By>;
  ibc_cashflow_pending_mainnet?: InputMaybe<Order_By>;
  ibc_cashflow_rating?: InputMaybe<Order_By>;
  ibc_cashflow_rating_diff?: InputMaybe<Order_By>;
  ibc_cashflow_weight?: InputMaybe<Order_By>;
  ibc_peers?: InputMaybe<Order_By>;
  ibc_peers_mainnet?: InputMaybe<Order_By>;
  ibc_percent?: InputMaybe<Order_By>;
  ibc_transfers?: InputMaybe<Order_By>;
  ibc_transfers_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_mainnet_weight?: InputMaybe<Order_By>;
  ibc_transfers_pending?: InputMaybe<Order_By>;
  ibc_transfers_pending_mainnet?: InputMaybe<Order_By>;
  ibc_transfers_rating?: InputMaybe<Order_By>;
  ibc_transfers_rating_diff?: InputMaybe<Order_By>;
  ibc_transfers_weight?: InputMaybe<Order_By>;
  ibc_tx_failed?: InputMaybe<Order_By>;
  ibc_tx_failed_diff?: InputMaybe<Order_By>;
  ibc_tx_in?: InputMaybe<Order_By>;
  ibc_tx_in_diff?: InputMaybe<Order_By>;
  ibc_tx_in_failed?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_in_rating?: InputMaybe<Order_By>;
  ibc_tx_in_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_in_weight?: InputMaybe<Order_By>;
  ibc_tx_out?: InputMaybe<Order_By>;
  ibc_tx_out_diff?: InputMaybe<Order_By>;
  ibc_tx_out_failed?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_mainnet_weight?: InputMaybe<Order_By>;
  ibc_tx_out_rating?: InputMaybe<Order_By>;
  ibc_tx_out_rating_diff?: InputMaybe<Order_By>;
  ibc_tx_out_weight?: InputMaybe<Order_By>;
  relations_cnt_open?: InputMaybe<Order_By>;
  success_rate?: InputMaybe<Order_By>;
  success_rate_mainnet?: InputMaybe<Order_By>;
  timeframe?: InputMaybe<Order_By>;
  total_active_addresses?: InputMaybe<Order_By>;
  total_active_addresses_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_mainnet_weight?: InputMaybe<Order_By>;
  total_active_addresses_rating?: InputMaybe<Order_By>;
  total_active_addresses_rating_diff?: InputMaybe<Order_By>;
  total_active_addresses_weight?: InputMaybe<Order_By>;
  total_coin_turnover_amount?: InputMaybe<Order_By>;
  total_coin_turnover_amount_diff?: InputMaybe<Order_By>;
  total_ibc_txs?: InputMaybe<Order_By>;
  total_ibc_txs_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_ibc_txs_rating?: InputMaybe<Order_By>;
  total_ibc_txs_rating_diff?: InputMaybe<Order_By>;
  total_ibc_txs_weight?: InputMaybe<Order_By>;
  total_txs?: InputMaybe<Order_By>;
  total_txs_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_rating?: InputMaybe<Order_By>;
  total_txs_mainnet_rating_diff?: InputMaybe<Order_By>;
  total_txs_mainnet_weight?: InputMaybe<Order_By>;
  total_txs_rating?: InputMaybe<Order_By>;
  total_txs_rating_diff?: InputMaybe<Order_By>;
  total_txs_weight?: InputMaybe<Order_By>;
};
