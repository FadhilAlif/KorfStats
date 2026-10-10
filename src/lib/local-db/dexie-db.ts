import Dexie, { Table } from 'dexie';
import { MatchEvent, MatchState, Player, Team } from '@/types/match';

export interface LocalSyncQueueItem {
  id?: number;
  eventId: string;
  matchId: string;
  payload: MatchEvent;
  createdAt: number;
  synced: boolean;
}

export class KorfStatsDatabase extends Dexie {
  matches!: Table<MatchState, string>;
  teams!: Table<Team, string>;
  players!: Table<Player, string>;
  events!: Table<MatchEvent, string>;
  syncQueue!: Table<LocalSyncQueueItem, number>;

  constructor() {
    super('KorfStatsDB');
    this.version(1).stores({
      matches: 'id, matchCode, status, matchDate',
      teams: 'id, name, code',
      players: 'id, teamId, jerseyNumber, gender',
      events: 'clientEventId, id, matchId, playerId, teamId, recordedAt',
      syncQueue: '++id, eventId, matchId, synced, createdAt',
    });
  }
}

export const localDb = new KorfStatsDatabase();
