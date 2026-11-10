import {
  Booking,
  ConsoleConfig,
  ConsoleType,
  Customer,
  DatabaseTables,
  GamingZone,
  Match,
  MatchReport,
  PaymentMethod,
  Tournament,
  TournamentRegistration,
} from '../models';
import { addDays, hourToTime, toLocalDateTime, toLocalIsoDateTime } from '../utils/date-time.utils';
import { calculateTotalPrice } from '../utils/price.utils';

const ZONE_IDS = {
  levelUp: 'zone-level-up',
  gameOn: 'zone-game-on',
  pixelLounge: 'zone-pixel-lounge',
  respawn: 'zone-respawn',
  playerOne: 'zone-player-one',
};

const SEED_EMAIL_DOMAIN = '@example.com';
const CUSTOMER_CREATED_DAYS_AGO = 40;
const BOOKING_CREATED_FIRST_HOUR = 9;
const BOOKING_CREATED_HOUR_SPREAD = 10;
const REGISTRATION_DAYS_SPREAD = 14;
const REGISTRATION_HOUR = 11;
const CUSTOMER_CREATED_HOUR = 10;

const SEED_ZONES: GamingZone[] = [
  {
    id: ZONE_IDS.levelUp,
    name: 'Level Up Gaming',
    address: 'Block 13',
    area: 'Gulshan-e-Iqbal',
    contactNumber: '0321 4567890',
    contactEmail: 'hello@levelupgaming.example.com',
    facilities: 'Air conditioning, 4K screens, snacks bar, free Wi-Fi',
    isActive: true,
  },
  {
    id: ZONE_IDS.gameOn,
    name: 'Game On Arena',
    address: 'Block 6',
    area: 'Gulshan-e-Iqbal',
    contactNumber: '0333 2145678',
    facilities: 'Air conditioning, gaming chairs, cold drinks',
    isActive: true,
  },
  {
    id: ZONE_IDS.pixelLounge,
    name: 'Pixel Lounge',
    address: 'Phase 6, Khayaban-e-Shahbaz',
    area: 'DHA',
    contactNumber: '0300 8765432',
    contactEmail: 'bookings@pixellounge.example.com',
    facilities: 'Private PC rooms, VR corner, café, parking',
    isActive: true,
  },
  {
    id: ZONE_IDS.respawn,
    name: 'Respawn Zone',
    address: 'Block 5',
    area: 'Clifton',
    contactNumber: '0345 1122334',
    facilities: 'Air conditioning, sea-view lounge',
    isActive: false,
  },
  {
    id: ZONE_IDS.playerOne,
    name: 'Player One Hub',
    address: 'Block H',
    area: 'North Nazimabad',
    contactNumber: '0312 9988776',
    facilities: 'Air conditioning, tournament stage, snacks',
    isActive: true,
  },
];

// prettier-ignore
const SEED_CONSOLES: ConsoleConfig[] = [
  { id: 'console-lu-ps5', zoneId: ZONE_IDS.levelUp, consoleType: 'PS5', quantity: 4, pricePerHour: 500 },
  { id: 'console-lu-ps4', zoneId: ZONE_IDS.levelUp, consoleType: 'PS4', quantity: 3, pricePerHour: 300 },
  { id: 'console-lu-xbox', zoneId: ZONE_IDS.levelUp, consoleType: 'Xbox', quantity: 2, pricePerHour: 400 },
  { id: 'console-lu-pc', zoneId: ZONE_IDS.levelUp, consoleType: 'PC Room', quantity: 2, pricePerHour: 400 },
  { id: 'console-go-ps5', zoneId: ZONE_IDS.gameOn, consoleType: 'PS5', quantity: 3, pricePerHour: 450 },
  { id: 'console-go-ps4', zoneId: ZONE_IDS.gameOn, consoleType: 'PS4', quantity: 4, pricePerHour: 280 },
  { id: 'console-go-pc', zoneId: ZONE_IDS.gameOn, consoleType: 'PC Room', quantity: 3, pricePerHour: 350 },
  { id: 'console-px-ps5', zoneId: ZONE_IDS.pixelLounge, consoleType: 'PS5', quantity: 5, pricePerHour: 550 },
  { id: 'console-px-ps4', zoneId: ZONE_IDS.pixelLounge, consoleType: 'PS4', quantity: 2, pricePerHour: 320 },
  { id: 'console-px-xbox', zoneId: ZONE_IDS.pixelLounge, consoleType: 'Xbox', quantity: 3, pricePerHour: 450 },
  { id: 'console-px-pc', zoneId: ZONE_IDS.pixelLounge, consoleType: 'PC Room', quantity: 4, pricePerHour: 450 },
  { id: 'console-rz-ps5', zoneId: ZONE_IDS.respawn, consoleType: 'PS5', quantity: 2, pricePerHour: 500 },
  { id: 'console-rz-ps4', zoneId: ZONE_IDS.respawn, consoleType: 'PS4', quantity: 2, pricePerHour: 300 },
  { id: 'console-po-ps5', zoneId: ZONE_IDS.playerOne, consoleType: 'PS5', quantity: 3, pricePerHour: 480 },
  { id: 'console-po-ps4', zoneId: ZONE_IDS.playerOne, consoleType: 'PS4', quantity: 3, pricePerHour: 250 },
  { id: 'console-po-xbox', zoneId: ZONE_IDS.playerOne, consoleType: 'Xbox', quantity: 2, pricePerHour: 380 },
];

const SEED_CUSTOMER_NAMES = [
  'Ali Khan',
  'Ahmed Raza',
  'Bilal Hussain',
  'Hamza Siddiqui',
  'Usman Tariq',
  'Zain Ahmed',
  'Fahad Malik',
  'Saad Qureshi',
  'Hassan Javed',
  'Danish Iqbal',
  'Ayesha Noor',
  'Sana Shah',
  'Omer Farooq',
  'Talha Rehman',
  'Imran Butt',
];

interface BookingSeed {
  zoneId: string;
  customer: number | string;
  consoleType: ConsoleType;
  dayOffset: number;
  startHour: number;
  durationHours: number;
  paymentMethod?: PaymentMethod;
  isCancelled?: boolean;
}

// prettier-ignore
const BOOKING_SEEDS: BookingSeed[] = [
  { zoneId: ZONE_IDS.levelUp, customer: 1, consoleType: 'PS5', dayOffset: -30, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.gameOn, customer: 2, consoleType: 'PS4', dayOffset: -29, startHour: 14, durationHours: 3, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 3, consoleType: 'PC Room', dayOffset: -28, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.playerOne, customer: 4, consoleType: 'Xbox', dayOffset: -27, startHour: 20, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 5, consoleType: 'PS4', dayOffset: -26, startHour: 12, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.respawn, customer: 6, consoleType: 'PS5', dayOffset: -25, startHour: 16, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.gameOn, customer: 7, consoleType: 'PS5', dayOffset: -24, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 8, consoleType: 'Xbox', dayOffset: -23, startHour: 20, durationHours: 1, paymentMethod: 'Cash', isCancelled: true },
  { zoneId: ZONE_IDS.levelUp, customer: 9, consoleType: 'Xbox', dayOffset: -22, startHour: 14, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.playerOne, customer: 10, consoleType: 'PS5', dayOffset: -21, startHour: 16, durationHours: 3, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 11, consoleType: 'PS5', dayOffset: -20, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.gameOn, customer: 12, consoleType: 'PC Room', dayOffset: -19, startHour: 20, durationHours: 2, paymentMethod: 'Online', isCancelled: true },
  { zoneId: ZONE_IDS.pixelLounge, customer: 13, consoleType: 'PS5', dayOffset: -18, startHour: 12, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 14, consoleType: 'PC Room', dayOffset: -17, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.playerOne, customer: 'Rizwan Ali', consoleType: 'PS4', dayOffset: -16, startHour: 18, durationHours: 2 },
  { zoneId: ZONE_IDS.respawn, customer: 0, consoleType: 'PS4', dayOffset: -15, startHour: 14, durationHours: 2, paymentMethod: 'Cash', isCancelled: true },
  { zoneId: ZONE_IDS.levelUp, customer: 1, consoleType: 'PS5', dayOffset: -14, startHour: 20, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.gameOn, customer: 2, consoleType: 'PS4', dayOffset: -13, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 3, consoleType: 'PS4', dayOffset: -12, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.playerOne, customer: 4, consoleType: 'PS5', dayOffset: -11, startHour: 12, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 5, consoleType: 'PS4', dayOffset: -10, startHour: 14, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.gameOn, customer: 6, consoleType: 'PS5', dayOffset: -10, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 7, consoleType: 'PC Room', dayOffset: -9, startHour: 20, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 8, consoleType: 'Xbox', dayOffset: -8, startHour: 16, durationHours: 3, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.playerOne, customer: 9, consoleType: 'Xbox', dayOffset: -7, startHour: 18, durationHours: 2, paymentMethod: 'Cash', isCancelled: true },
  { zoneId: ZONE_IDS.levelUp, customer: 10, consoleType: 'PS5', dayOffset: -6, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.gameOn, customer: 11, consoleType: 'PC Room', dayOffset: -5, startHour: 14, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 12, consoleType: 'PS5', dayOffset: -5, startHour: 20, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 13, consoleType: 'PC Room', dayOffset: -4, startHour: 20, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.playerOne, customer: 14, consoleType: 'PS4', dayOffset: -4, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 0, consoleType: 'PS5', dayOffset: -3, startHour: 14, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.gameOn, customer: 'Nadeem Abbas', consoleType: 'PS4', dayOffset: -3, startHour: 20, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 1, consoleType: 'Xbox', dayOffset: -2, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.levelUp, customer: 2, consoleType: 'PS4', dayOffset: -2, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.playerOne, customer: 3, consoleType: 'PS5', dayOffset: -1, startHour: 20, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 4, consoleType: 'Xbox', dayOffset: -1, startHour: 18, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.gameOn, customer: 5, consoleType: 'PS5', dayOffset: -1, startHour: 16, durationHours: 2, paymentMethod: 'Card', isCancelled: true },
  { zoneId: ZONE_IDS.pixelLounge, customer: 6, consoleType: 'PC Room', dayOffset: -1, startHour: 14, durationHours: 3, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 0, consoleType: 'PS5', dayOffset: 0, startHour: 14, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 1, consoleType: 'Xbox', dayOffset: 0, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 'Kamran Akhtar', consoleType: 'Xbox', dayOffset: 0, startHour: 16, durationHours: 2 },
  { zoneId: ZONE_IDS.levelUp, customer: 2, consoleType: 'PS4', dayOffset: 0, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.levelUp, customer: 3, consoleType: 'PS4', dayOffset: 0, startHour: 18, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 'Faisal Mehmood', consoleType: 'PS4', dayOffset: 0, startHour: 18, durationHours: 3 },
  { zoneId: ZONE_IDS.levelUp, customer: 5, consoleType: 'PC Room', dayOffset: 0, startHour: 20, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 4, consoleType: 'PC Room', dayOffset: 0, startHour: 20, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.gameOn, customer: 7, consoleType: 'PS5', dayOffset: 0, startHour: 18, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 8, consoleType: 'PC Room', dayOffset: 0, startHour: 20, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 9, consoleType: 'PS5', dayOffset: 1, startHour: 16, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.gameOn, customer: 10, consoleType: 'PS4', dayOffset: 1, startHour: 18, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 11, consoleType: 'PS5', dayOffset: 2, startHour: 20, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.levelUp, customer: 12, consoleType: 'PC Room', dayOffset: 2, startHour: 18, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.playerOne, customer: 13, consoleType: 'Xbox', dayOffset: 3, startHour: 16, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.levelUp, customer: 14, consoleType: 'PS4', dayOffset: 3, startHour: 20, durationHours: 2, paymentMethod: 'Cash', isCancelled: true },
  { zoneId: ZONE_IDS.gameOn, customer: 0, consoleType: 'PC Room', dayOffset: 4, startHour: 14, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 1, consoleType: 'Xbox', dayOffset: 5, startHour: 18, durationHours: 2, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.levelUp, customer: 2, consoleType: 'Xbox', dayOffset: 5, startHour: 20, durationHours: 2, paymentMethod: 'Cash' },
  { zoneId: ZONE_IDS.playerOne, customer: 3, consoleType: 'PS5', dayOffset: 6, startHour: 18, durationHours: 2, paymentMethod: 'Online' },
  { zoneId: ZONE_IDS.levelUp, customer: 4, consoleType: 'PS5', dayOffset: 7, startHour: 16, durationHours: 3, paymentMethod: 'Card' },
  { zoneId: ZONE_IDS.pixelLounge, customer: 'Arsalan Haider', consoleType: 'PS4', dayOffset: 7, startHour: 14, durationHours: 2 },
];

interface TournamentSeed {
  tournament: Tournament;
  registrationCount: number;
}

const PLAYER_FIRST_NAMES = [
  'Ahsan',
  'Areeb',
  'Babar',
  'Danyal',
  'Ehsan',
  'Faraz',
  'Haris',
  'Junaid',
  'Kashif',
  'Moiz',
  'Naveed',
  'Owais',
];
const PLAYER_LAST_NAMES = [
  'Qureshi',
  'Siddiqui',
  'Sheikh',
  'Chaudhry',
  'Abbasi',
  'Mirza',
  'Ansari',
  'Baig',
];

function toEmail(name: string): string {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}${SEED_EMAIL_DOMAIN}`;

  return email;
}

function toTimestamp(isoDate: string, hour: number): string {
  const timestamp = toLocalDateTime(isoDate, hourToTime(hour)).toISOString();

  return timestamp;
}

function createCustomers(today: string): Customer[] {
  const customers = SEED_CUSTOMER_NAMES.map((name, index) => {
    const customer: Customer = {
      id: `customer-${index + 1}`,
      email: toEmail(name),
      name,
      createdAt: toTimestamp(
        addDays(today, index - CUSTOMER_CREATED_DAYS_AGO),
        CUSTOMER_CREATED_HOUR,
      ),
    };

    return customer;
  });

  return customers;
}

function findSeedPrice(zoneId: string, consoleType: ConsoleType): number {
  const consoleConfig = SEED_CONSOLES.find(
    (config) => config.zoneId === zoneId && config.consoleType === consoleType,
  );
  const pricePerHour = consoleConfig?.pricePerHour ?? 0;

  return pricePerHour;
}

function createBookings(today: string): Booking[] {
  const bookings = BOOKING_SEEDS.map((seed, index) => {
    const isWalkIn = typeof seed.customer === 'string';
    const customerName =
      typeof seed.customer === 'string' ? seed.customer : SEED_CUSTOMER_NAMES[seed.customer];
    const pricePerHour = findSeedPrice(seed.zoneId, seed.consoleType);
    const createdDay = addDays(today, Math.min(seed.dayOffset, 0) - 1);
    const createdHour = BOOKING_CREATED_FIRST_HOUR + (index % BOOKING_CREATED_HOUR_SPREAD);

    const booking: Booking = {
      id: `booking-${index + 1}`,
      zoneId: seed.zoneId,
      customerName,
      customerEmail: isWalkIn ? undefined : toEmail(customerName),
      consoleType: seed.consoleType,
      date: addDays(today, seed.dayOffset),
      startTime: hourToTime(seed.startHour),
      durationHours: seed.durationHours,
      pricePerHour,
      totalPrice: calculateTotalPrice(pricePerHour, seed.durationHours),
      paymentMethod: seed.paymentMethod,
      status: seed.isCancelled ? 'Cancelled' : 'Confirmed',
      createdAt: toTimestamp(createdDay, createdHour),
    };

    return booking;
  });

  return bookings;
}

function createTournamentSeeds(today: string): TournamentSeed[] {
  const tournamentSeeds: TournamentSeed[] = [
    {
      tournament: {
        id: 'tournament-1',
        name: 'Gulshan FIFA Cup',
        game: 'FIFA',
        consoleType: 'PS5',
        zoneId: ZONE_IDS.levelUp,
        date: addDays(today, 10),
        startTime: '16:00',
        maxPlayers: 32,
        entryFee: 1000,
        prize: 'Rs 30,000 and a trophy',
        description: 'Knockout FIFA tournament. Matches are 6 minutes per half.',
        status: 'Published',
      },
      registrationCount: 24,
    },
    {
      tournament: {
        id: 'tournament-2',
        name: 'Tekken Weekend Clash',
        game: 'Tekken',
        consoleType: 'PS5',
        zoneId: ZONE_IDS.pixelLounge,
        date: addDays(today, 4),
        startTime: '18:00',
        maxPlayers: 16,
        entryFee: 800,
        prize: 'Rs 15,000',
        description: 'Best of three rounds. Double elimination.',
        status: 'Published',
      },
      registrationCount: 10,
    },
    {
      tournament: {
        id: 'tournament-3',
        name: 'Winter FIFA League',
        game: 'FIFA',
        consoleType: 'PS5',
        zoneId: ZONE_IDS.gameOn,
        date: addDays(today, 30),
        startTime: '15:00',
        maxPlayers: 64,
        entryFee: 1500,
        prize: 'Rs 75,000',
        description: 'Group stage followed by knockouts.',
        status: 'Draft',
      },
      registrationCount: 0,
    },
    {
      tournament: {
        id: 'tournament-4',
        name: 'Clifton Tekken Open',
        game: 'Tekken',
        consoleType: 'PS4',
        zoneId: ZONE_IDS.respawn,
        date: addDays(today, 6),
        startTime: '17:00',
        maxPlayers: 16,
        entryFee: 500,
        prize: 'Rs 10,000',
        description: 'Open bracket for all skill levels.',
        status: 'Cancelled',
      },
      registrationCount: 12,
    },
  ];

  return tournamentSeeds;
}

function createRegistrations(
  today: string,
  tournamentSeeds: TournamentSeed[],
): TournamentRegistration[] {
  const registrations: TournamentRegistration[] = [];

  tournamentSeeds.forEach((seed) => {
    for (let playerIndex = 0; playerIndex < seed.registrationCount; playerIndex++) {
      const firstName = PLAYER_FIRST_NAMES[playerIndex % PLAYER_FIRST_NAMES.length];
      const lastName =
        PLAYER_LAST_NAMES[
          Math.floor(playerIndex / PLAYER_FIRST_NAMES.length) % PLAYER_LAST_NAMES.length
        ];
      const playerName = `${firstName} ${lastName}`;
      const daysAgo = 1 + (playerIndex % REGISTRATION_DAYS_SPREAD);

      registrations.push({
        id: `${seed.tournament.id}-registration-${playerIndex + 1}`,
        tournamentId: seed.tournament.id,
        playerName,
        email: toEmail(playerName),
        registeredAt: toTimestamp(addDays(today, -daysAgo), REGISTRATION_HOUR),
      });
    }
  });

  return registrations;
}

function createMatches(today: string): Match[] {
  // prettier-ignore
  const matches: Match[] = [
    { id: 'match-1', game: 'FIFA', player1: 'Ali Khan', player2: 'Bilal Hussain', zoneId: ZONE_IDS.levelUp, dateTime: toLocalIsoDateTime(addDays(today, 1), '18:00'), status: 'Active' },
    { id: 'match-2', game: 'Tekken', player1: 'Hamza Siddiqui', zoneId: ZONE_IDS.pixelLounge, dateTime: toLocalIsoDateTime(addDays(today, 2), '20:00'), status: 'Active' },
    { id: 'match-3', game: 'FIFA', player1: 'Zain Ahmed', player2: 'Saad Qureshi', zoneId: ZONE_IDS.gameOn, dateTime: toLocalIsoDateTime(addDays(today, 3), '17:00'), status: 'Active' },
    { id: 'match-4', game: 'Tekken', player1: 'Usman Tariq', zoneId: ZONE_IDS.playerOne, dateTime: toLocalIsoDateTime(addDays(today, 1), '19:00'), status: 'Active' },
    { id: 'match-5', game: 'FIFA', player1: 'Ahmed Raza', player2: 'Fahad Malik', zoneId: ZONE_IDS.levelUp, dateTime: toLocalIsoDateTime(addDays(today, -3), '18:00'), status: 'Completed', result: 'Ahmed Raza won 3–1' },
    { id: 'match-6', game: 'Tekken', player1: 'Hassan Javed', player2: 'Danish Iqbal', zoneId: ZONE_IDS.pixelLounge, dateTime: toLocalIsoDateTime(addDays(today, -5), '20:00'), status: 'Completed', result: 'Danish Iqbal won 3–2' },
    { id: 'match-7', game: 'FIFA', player1: 'Omer Farooq', player2: 'Talha Rehman', zoneId: ZONE_IDS.gameOn, dateTime: toLocalIsoDateTime(addDays(today, -8), '16:00'), status: 'Completed', result: 'Omer Farooq won 2–0' },
  ];
  const matchesWithEmails = matches.map((match) =>
    Object.assign({}, match, {
      player1Email: toEmail(match.player1),
      player2Email: match.player2 ? toEmail(match.player2) : undefined,
    }),
  );

  return matchesWithEmails;
}

function createMatchReports(today: string): MatchReport[] {
  // prettier-ignore
  const matchReports: MatchReport[] = [
    { id: 'report-1', matchId: 'match-5', reportedBy: 'Fahad Malik', reason: 'Opponent paused the game during an attack.', reportedAt: toTimestamp(addDays(today, -3), 21), status: 'Open' },
    { id: 'report-2', matchId: 'match-6', reportedBy: 'Hassan Javed', reason: 'The final score was entered wrongly.', reportedAt: toTimestamp(addDays(today, -4), 12), status: 'Open' },
    { id: 'report-3', matchId: 'match-7', reportedBy: 'Talha Rehman', reason: 'Opponent arrived 30 minutes late.', reportedAt: toTimestamp(addDays(today, -7), 15), status: 'Resolved' },
  ];

  return matchReports;
}

export function createSeedData(today: string): DatabaseTables {
  const tournamentSeeds = createTournamentSeeds(today);

  const seedData: DatabaseTables = {
    zones: SEED_ZONES,
    consoles: SEED_CONSOLES,
    bookings: createBookings(today),
    customers: createCustomers(today),
    tournaments: tournamentSeeds.map((seed) => seed.tournament),
    registrations: createRegistrations(today, tournamentSeeds),
    matches: createMatches(today),
    matchReports: createMatchReports(today),
  };

  return seedData;
}
