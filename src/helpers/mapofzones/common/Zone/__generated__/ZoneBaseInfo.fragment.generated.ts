/**
 * NOTE: THIS IS AN AUTO-GENERATED FILE. DO NOT MODIFY IT DIRECTLY.
 */
/* eslint-disable */

import * as Types from '../../../base-types';
import { DocumentNode } from 'graphql';

export type ZoneBaseInfoV1Fragment = { zone: string; logoUrl?: string | null; name: string };

export type ZoneBaseInfoV2Fragment = { zone: string; logoUrl?: string | null; name: string };

export const ZoneBaseInfoV1FragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ZoneBaseInfoV1' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'zones_stats' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zone' } },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'logoUrl' },
            name: { kind: 'Name', value: 'zone_label_url' },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'name' },
            name: { kind: 'Name', value: 'zone_readable_name' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode;
export const ZoneBaseInfoV2FragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ZoneBaseInfoV2' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'flat_blockchains' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'zone' },
            name: { kind: 'Name', value: 'network_id' },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'logoUrl' },
            name: { kind: 'Name', value: 'logo_url' },
          },
          {
            kind: 'Field',
            alias: { kind: 'Name', value: 'name' },
            name: { kind: 'Name', value: 'name' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode;
