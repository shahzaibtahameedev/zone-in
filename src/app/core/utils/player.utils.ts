import { PLAYER_NAME_MAX_LENGTH, PLAYER_NAME_MIN_LENGTH } from '../config/app.constants';
import { isInPast } from './date-time.utils';

const PLAYER_NAME_MESSAGE = `Your name must be ${PLAYER_NAME_MIN_LENGTH} to ${PLAYER_NAME_MAX_LENGTH} characters.`;

export function getPlayerNameError(playerName: string): string | null {
  const nameLength = playerName.trim().length;
  const isValidLength =
    nameLength >= PLAYER_NAME_MIN_LENGTH && nameLength <= PLAYER_NAME_MAX_LENGTH;
  const playerNameError = isValidLength ? null : PLAYER_NAME_MESSAGE;

  return playerNameError;
}

export function isDateTimeInPast(isoDateTime: string): boolean {
  const [isoDate, time] = isoDateTime.split('T');
  const hasPassed = isInPast(isoDate, time);

  return hasPassed;
}
