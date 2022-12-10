/**
 * NOTE: THIS IS AN AUTO-GENERATED FILE. DO NOT MODIFY IT DIRECTLY.
 */
/* eslint-disable */

import * as Types from './base-types';
import { DocumentNode } from 'graphql';

import { ZoneBaseInfoV2FragmentDoc } from './common/Zone/__generated__/ZoneBaseInfo.fragment.generated';
export type ZonesTableQueryVariables = Types.Exact<{
  period: Types.Scalars['Int'];
  isMainnet: Types.Scalars['Boolean'];
}>;

export type ZonesTableQueryResult = {
  zonesTable: Array<{
    isZoneUpToDate?: boolean | null;
    zone: string;
    logoUrl?: string | null;
    name: string;
    switchedStats: Array<{
      channelsCount: number;
      peersCount: number;
      ibcTransfers: number;
      ibcTransfersPending: number;
      ibcTransfersRating: number;
      ibcTransfersRatingDiff: number;
      ibcVolume: any;
      ibcVolumePending: any;
      ibcVolumeRating: number;
      ibcVolumeRatingDiff: number;
      ibcVolumeIn: any;
      ibcVolumeInPending: any;
      ibcVolumeInRating: number;
      ibcVolumeInRatingDiff: number;
      ibcVolumeOut: any;
      ibcVolumeOutPending: any;
      ibcVolumeOutRating: number;
      ibcVolumeOutRatingDiff: number;
      totalIbcTxsRating: number;
      totalIbcTxsRatingDiff: number;
      dauRating?: number | null;
      dauRatingDiff?: number | null;
      ibcDauRating: number;
      ibcDauRatingDiff: number;
      ibcVolumeChart: Array<{ volume?: any | null }>;
    }>;
    stats: Array<{ totalTxs: number; dau?: number | null; ibcDau?: number | null }>;
  }>;
};

export const ZonesTableDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ZonesTable' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'period' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'isMainnet' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'zonesTable' },
            name: { kind: 'Name', value: 'flat_blockchains' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'is_mainnet' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: '_eq' },
                            value: { kind: 'Variable', name: { kind: 'Name', value: 'isMainnet' } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ZoneBaseInfoV2' } },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'isZoneUpToDate' },
                  name: { kind: 'Name', value: 'is_synced' },
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'switchedStats' },
                  name: { kind: 'Name', value: 'blockchain_switched_stats' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'where' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'is_mainnet' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: '_eq' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'isMainnet' },
                                  },
                                },
                              ],
                            },
                          },
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'timeframe' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: '_eq' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'period' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'channelsCount' },
                        name: { kind: 'Name', value: 'channels_cnt' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'peersCount' },
                        name: { kind: 'Name', value: 'ibc_peers' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcTransfers' },
                        name: { kind: 'Name', value: 'ibc_transfers' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcTransfersPending' },
                        name: { kind: 'Name', value: 'ibc_transfers_pending' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcTransfersRating' },
                        name: { kind: 'Name', value: 'ibc_transfers_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcTransfersRatingDiff' },
                        name: { kind: 'Name', value: 'ibc_transfers_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolume' },
                        name: { kind: 'Name', value: 'ibc_cashflow' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumePending' },
                        name: { kind: 'Name', value: 'ibc_cashflow_pending' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeRating' },
                        name: { kind: 'Name', value: 'ibc_cashflow_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeRatingDiff' },
                        name: { kind: 'Name', value: 'ibc_cashflow_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeIn' },
                        name: { kind: 'Name', value: 'ibc_cashflow_in' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeInPending' },
                        name: { kind: 'Name', value: 'ibc_cashflow_in_pending' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeInRating' },
                        name: { kind: 'Name', value: 'ibc_cashflow_in_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeInRatingDiff' },
                        name: { kind: 'Name', value: 'ibc_cashflow_in_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeOut' },
                        name: { kind: 'Name', value: 'ibc_cashflow_out' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeOutPending' },
                        name: { kind: 'Name', value: 'ibc_cashflow_out_pending' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeOutRating' },
                        name: { kind: 'Name', value: 'ibc_cashflow_out_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeOutRatingDiff' },
                        name: { kind: 'Name', value: 'ibc_cashflow_out_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcVolumeChart' },
                        name: { kind: 'Name', value: 'blockchain_tf_switched_charts' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'where' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'chart_type' },
                                  value: {
                                    kind: 'ObjectValue',
                                    fields: [
                                      {
                                        kind: 'ObjectField',
                                        name: { kind: 'Name', value: '_eq' },
                                        value: {
                                          kind: 'StringValue',
                                          value: 'cashflow',
                                          block: false,
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'order_by' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: 'point_index' },
                                  value: { kind: 'EnumValue', value: 'asc' },
                                },
                              ],
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              alias: { kind: 'Name', value: 'volume' },
                              name: { kind: 'Name', value: 'point_value' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'totalIbcTxsRating' },
                        name: { kind: 'Name', value: 'txs_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'totalIbcTxsRatingDiff' },
                        name: { kind: 'Name', value: 'txs_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'dauRating' },
                        name: { kind: 'Name', value: 'active_addresses_cnt_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'dauRatingDiff' },
                        name: { kind: 'Name', value: 'active_addresses_cnt_rating_diff' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcDauRating' },
                        name: { kind: 'Name', value: 'ibc_active_addresses_cnt_rating' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcDauRatingDiff' },
                        name: { kind: 'Name', value: 'ibc_active_addresses_cnt_rating_diff' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  alias: { kind: 'Name', value: 'stats' },
                  name: { kind: 'Name', value: 'blockchain_stats' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'where' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'timeframe' },
                            value: {
                              kind: 'ObjectValue',
                              fields: [
                                {
                                  kind: 'ObjectField',
                                  name: { kind: 'Name', value: '_eq' },
                                  value: {
                                    kind: 'Variable',
                                    name: { kind: 'Name', value: 'period' },
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'totalTxs' },
                        name: { kind: 'Name', value: 'txs' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'dau' },
                        name: { kind: 'Name', value: 'active_addresses_cnt' },
                      },
                      {
                        kind: 'Field',
                        alias: { kind: 'Name', value: 'ibcDau' },
                        name: { kind: 'Name', value: 'ibc_active_addresses_cnt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    ...ZoneBaseInfoV2FragmentDoc.definitions,
  ],
} as unknown as DocumentNode;
