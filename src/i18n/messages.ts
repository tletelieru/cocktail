import { createContext, useContext } from 'react'
import type { GameId, GameIssue, RuleLabels } from '../lib/scoring'
import type { TextSize } from '../lib/textSize'
import { defaultLocale } from './locales'
import type { Locale } from './locales'

export interface Messages {
  appName: string
  match: string
  history: string
  rules: string
  rulesTitle: string
  rulesBasics: string[]
  dealTitle: string
  dealRules: string[]
  playTitle: string
  playRules: string[]
  dominoRule: string
  fixedTotal: (four: string, three: string) => string
  noFixedTotal: string
  newMatch: string
  playerCount: (n: number) => string
  playerName: (n: number) => string
  defaultPlayer: (n: number) => string
  start: string
  game: string
  games: Record<GameId, string>
  tricks: string
  hearts: string
  queens: string
  cards: string
  lastTrick: string
  sevenShort: string
  won: string
  total: string
  more: string
  less: string
  of: string
  rule: RuleLabels
  issues: {
    missing: (n: number) => string
    extra: (n: number) => string
    noWinner: string
    noCards: string
    noTricks: string
  }
  finish: string
  discard: string
  discardConfirm: string
  emptyHistory: string
  remove: string
  removeConfirm: string
  settings: string
  textSize: string
  textSizes: Record<TextSize, string>
  toLight: string
  toDark: string
  language: string
  install: string
  developedBy: string
}

export const messages: Record<Locale, Messages> = {
  en: {
    appName: 'Cocktail',
    match: 'Match',
    history: 'History',
    rules: 'Rules',
    rulesTitle: 'How to play',
    rulesBasics: [
      'Trick-taking game with a standard deck, for 3 or 4 players.',
      'With 4 players there are 13 tricks. With 3, the 2 of diamonds is removed and there are 17.',
      'Each trick goes to the highest card of the first suit played.',
      'There are 6 games, always in the same order.',
      'The last trick counts twice: its normal 10 plus the 50 for being last.',
    ],
    dealTitle: 'Dealing',
    dealRules: [
      'Anyone can deal first.',
      'Deal in two rounds: 6 and 7 cards with 4 players (13), 7 and 10 cards with 3 players (17).',
      'The player to the right of the dealer leads.',
      'In the next game, the player to the right deals. Everything goes counterclockwise.',
    ],
    playTitle: 'Playing a trick',
    playRules: [
      'You must follow suit. If you can\'t, play any card.',
      'There are no trumps, so a card off suit never wins the trick.',
      'The leader can play any card, including hearts, queens or the 7 of clubs.',
    ],
    dominoRule:
      'The player to the right of the dealer starts, and passes without a 7. Build up and down by suit from the 7s. Players with no move pass. The first to run out of cards wins.',
    fixedTotal: (four, three) => `Fixed total: ${four} with 4 · ${three} with 3`,
    noFixedTotal: 'No fixed total: it depends on the cards left.',
    newMatch: 'New match',
    playerCount: (n) => `${n} players`,
    playerName: (n) => `Player ${n} name`,
    defaultPlayer: (n) => `Player ${n}`,
    start: 'Start',
    game: 'Game',
    games: {
      trebol: '7 of clubs',
      corazones: 'Hearts',
      quinas: 'Queens',
      todo: 'All',
      nada: 'Nothing',
      domino: 'Domino',
    },
    tricks: 'Tricks',
    hearts: 'Hearts',
    queens: 'Queens',
    cards: 'Cards',
    lastTrick: 'Last',
    sevenShort: '7♣',
    won: 'Won',
    total: 'Total',
    more: 'more',
    less: 'less',
    of: 'of',
    rule: {
      trick: 'Trick',
      heart: 'Heart',
      queen: 'Queen',
      seven: '7♣',
      last: 'Last',
      winner: 'Winner',
      others: 'Others',
      perCard: 'per card',
    },
    issues: {
      missing: (n) => `${n} missing`,
      extra: (n) => `${n} over`,
      noWinner: 'no winner',
      noCards: 'cards missing',
      noTricks: 'tricks missing',
    },
    finish: 'Finish match',
    discard: 'Discard',
    discardConfirm: 'Discard this match? It will not be saved to the history.',
    emptyHistory: 'No finished matches yet.',
    remove: 'Delete',
    removeConfirm: 'Delete this match from the history?',
    settings: 'Settings',
    textSize: 'Text size',
    textSizes: { normal: 'Normal', large: 'Large', xlarge: 'Extra large' },
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    language: 'Language',
    install: 'Install app',
    developedBy: 'Developed by',
  },
  es: {
    appName: 'Cocktail',
    match: 'Partida',
    history: 'Historial',
    rules: 'Reglas',
    rulesTitle: 'Cómo se juega',
    rulesBasics: [
      'Juego de basas con naipe inglés, para 3 o 4 jugadores.',
      'Con 4 jugadores son 13 basas. Con 3 se saca el 2 de diamante y son 17.',
      'Cada basa se la lleva la carta más alta de la primera pinta jugada.',
      'Son 6 juegos, siempre en el mismo orden.',
      'La última basa cuenta doble: sus 10 de basa normal más los 50 de última.',
    ],
    dealTitle: 'Reparto',
    dealRules: [
      'El primer repartidor puede ser cualquiera.',
      'Se reparte en dos tandas: 6 y 7 cartas con 4 jugadores (13), 7 y 10 cartas con 3 jugadores (17).',
      'Sale el jugador a la derecha del que repartió.',
      'En el juego siguiente reparte el de la derecha. Todo va en sentido antihorario.',
    ],
    playTitle: 'Cómo se juega una basa',
    playRules: [
      'Es obligatorio seguir pinta. Si no se tiene, se tira cualquier carta.',
      'No hay triunfo, así que quien no sigue pinta nunca gana la basa.',
      'Quien parte puede tirar cualquier carta, incluso corazones, quinas o el 7 de trébol.',
    ],
    dominoRule:
      'Sale el de la derecha del repartidor; si no tiene un 7, pasa. Se baja hacia arriba y abajo por pinta desde los 7. Quien no tiene jugada pasa. Gana el primero en quedar sin cartas.',
    fixedTotal: (four, three) => `Total fijo: ${four} con 4 · ${three} con 3`,
    noFixedTotal: 'Sin total fijo: depende de las cartas que quedan.',
    newMatch: 'Nueva partida',
    playerCount: (n) => `${n} jugadores`,
    playerName: (n) => `Nombre jugador ${n}`,
    defaultPlayer: (n) => `Jugador ${n}`,
    start: 'Empezar',
    game: 'Juego',
    games: {
      trebol: '7 de trébol',
      corazones: 'Corazones',
      quinas: 'Quinas',
      todo: 'Todo',
      nada: 'Nada',
      domino: 'Dominó',
    },
    tricks: 'Basas',
    hearts: 'Corazones',
    queens: 'Quinas',
    cards: 'Cartas',
    lastTrick: 'Última',
    sevenShort: '7♣',
    won: 'Ganó',
    total: 'Total',
    more: 'más',
    less: 'menos',
    of: 'de',
    rule: {
      trick: 'Basa',
      heart: 'Corazón',
      queen: 'Quina',
      seven: '7♣',
      last: 'Última',
      winner: 'Ganador',
      others: 'Demás',
      perCard: 'por carta',
    },
    issues: {
      missing: (n) => `faltan ${n}`,
      extra: (n) => `sobran ${n}`,
      noWinner: 'falta ganador',
      noCards: 'faltan cartas',
      noTricks: 'faltan basas',
    },
    finish: 'Terminar partida',
    discard: 'Descartar',
    discardConfirm: '¿Descartar esta partida? No queda en el historial.',
    emptyHistory: 'Todavía no hay partidas terminadas.',
    remove: 'Borrar',
    removeConfirm: '¿Borrar esta partida del historial?',
    settings: 'Ajustes',
    textSize: 'Tamaño del texto',
    textSizes: { normal: 'Normal', large: 'Grande', xlarge: 'Muy grande' },
    toLight: 'Cambiar a modo claro',
    toDark: 'Cambiar a modo oscuro',
    language: 'Idioma',
    install: 'Instalar app',
    developedBy: 'Desarrollado por',
  },
}

export const LocaleContext = createContext<Locale>(defaultLocale)

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useMessages(): Messages {
  return messages[useLocale()]
}

export function issueText(issue: GameIssue | null, t: Messages): string {
  if (!issue) return ''
  if (issue.kind === 'noWinner') return t.issues.noWinner
  if (issue.kind === 'noCards') return t.issues.noCards
  if (issue.kind === 'noTricks') return t.issues.noTricks
  return issue.kind === 'missing' ? t.issues.missing(issue.amount) : t.issues.extra(issue.amount)
}
