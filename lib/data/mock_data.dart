import '../models/parish.dart';
import '../models/daily_reading.dart';
import '../models/approval_request.dart';
import '../models/bo_user.dart';

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK PARISHES
// ─────────────────────────────────────────────────────────────────────────────
final List<Parish> mockParishes = [
  Parish(
    id: 'p1',
    country: 'Nigeria',
    archdiocese: 'Lagos',
    deanery: 'Festac',
    name: 'Christ the King Catholic Church (CKC)',
    address: '1 Church Road, Festac Town, Lagos',
    latitude: '6.4646',
    longitude: '3.2942',
    phone: '08037120696',
    email: 'ckc.festac@catholic.ng',
    website: 'https://ckc-festac.org',
    socials: const [
      ParishSocial(platform: 'Instagram', url: '@ckc_festac'),
      ParishSocial(platform: 'Facebook',  url: 'CKC Festac Town'),
    ],
    massTimes: MassTimes(
      sundayMasses: const ['6:30am', '8:45am', '11:00am', '5:30pm'],
      weekdayMasses: const [
        WeekdayMass(day: 'Mon & Fri', times: ['6:30am', '6:30pm']),
        WeekdayMass(day: 'Tue',       times: ['6:30am', '12:00pm', '6:30pm']),
        WeekdayMass(day: 'Wed',       times: ['6:30am', '6:30pm']),
        WeekdayMass(day: 'Thu',       times: ['6:30am', '12:00pm']),
        WeekdayMass(day: 'Sat',       times: ['7:00am']),
      ],
      holyDayMasses: const ['6:30am', '10:00am', '6:30pm'],
    ),
    contacts: const [
      ParishContact(id: 'c1', role: 'Parish Priest',     name: 'Rev. Fr Martin Uwakwe', phone: '08037120696', email: 'fr.martin@ckc.ng'),
      ParishContact(id: 'c2', role: 'Ass. Parish Priest', name: 'Rev. Fr James Obi',     phone: '08037120697'),
      ParishContact(id: 'c3', role: 'Parish Catechist',   name: 'Mr Martin Uwakwe',      phone: '08037120696'),
    ],
    pastoralTeam: const [
      PastoralTeamMember(id: 'pt1', name: 'Mrs Ada Nwosu',          role: 'Chairman, CWO',   phone: '08012345678'),
      PastoralTeamMember(id: 'pt2', name: 'Mr Chukwuemeka Eze',     role: 'President, CYO',  phone: '08098765432'),
      PastoralTeamMember(id: 'pt3', name: 'Mr Paul Eze',            role: 'Deacon',          phone: '08011223344'),
    ],
    activities: const [
      ParishActivity(id: 'ac1', name: 'Confession',          time: 'Saturday: 8:30am'),
      ParishActivity(id: 'ac2', name: 'Marriage Preparation', time: 'Saturday: 10:00am'),
      ParishActivity(id: 'ac3', name: 'Communion Rounds',     time: 'First Thursday/Friday'),
      ParishActivity(id: 'ac4', name: 'Marian Devotion',      time: 'Wednesday: 6:30am'),
      ParishActivity(id: 'ac5', name: 'Benediction',          time: 'Sunday: 6:30pm'),
      ParishActivity(id: 'ac6', name: 'Adoration',            time: 'Thursday: 6:30am'),
      ParishActivity(id: 'ac7', name: 'Bible Study',          time: 'Wednesday: 5:00pm'),
      ParishActivity(id: 'ac8', name: 'Youth Mass',           time: 'Every Sunday: 3:00pm'),
    ],
    announcements: const [
      ParishAnnouncement(
        id: 'an1', title: 'Confession',
        body: 'Confessions hold every Saturday at 8:30am. All parishioners are encouraged to make use of this sacrament regularly.',
      ),
      ParishAnnouncement(
        id: 'an2', title: 'Marriage Preparation',
        body: 'Couples intending to get married should see the parish priest at least 6 months before. Pre-marital classes: Saturdays 10am.',
      ),
      ParishAnnouncement(
        id: 'an3', title: 'Communion Rounds',
        body: 'First Thursday and Friday of every month: communion rounds to the sick, aged, and homebound parishioners.',
      ),
      ParishAnnouncement(
        id: 'an4', title: 'Weekly Blessings',
        body: 'Every 1st Sunday, workers and tithe payers are specially prayed for and blessed.',
      ),
    ],
    gallery: [],
    uploadedImages: [],
    status: ParishStatus.active,
    createdAt: DateTime(2025, 1, 10, 8),
    updatedAt: DateTime(2026, 2, 1, 12),
  ),
  Parish(
    id: 'p2',
    country: 'Nigeria',
    archdiocese: 'Lagos',
    deanery: 'Festac',
    name: 'St. Patrick Catholic Church',
    address: '5 Ex-20 Road, Festac Town, Lagos',
    latitude: '6.4630',
    longitude: '3.2910',
    massTimes: MassTimes(
      sundayMasses: const ['7:00am', '10:00am'],
      weekdayMasses: const [
        WeekdayMass(day: 'Mon–Fri', times: ['6:30am']),
        WeekdayMass(day: 'Sat',     times: ['7:00am']),
      ],
    ),
    contacts: const [
      ParishContact(id: 'c1', role: 'Parish Priest', name: 'Rev. Fr Emmanuel Okeke', phone: '08055667788'),
    ],
    pastoralTeam: [],
    activities: const [
      ParishActivity(id: 'ac1', name: 'Confession', time: 'Saturday: 9:00am'),
    ],
    announcements: [],
    gallery: [],
    uploadedImages: [],
    status: ParishStatus.pending,
    createdAt: DateTime(2025, 3, 1, 9),
    updatedAt: DateTime(2025, 3, 1, 9),
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK READINGS
// ─────────────────────────────────────────────────────────────────────────────
final List<DailyReading> mockReadings = [
  DailyReading(
    id: 'r1',
    date: DateTime(2026, 2, 26),
    dayTitle: 'Second Sunday of Lent',
    liturgyType: LiturgyType.sunday,
    vestment: VestmentColor.violet,
    todaysRosary: RosaryMystery.sorrowful,
    entranceAntiphon: '"My heart has said of you: Seek his face; it is your face, O Lord, that I seek. Hide not your face from me." (Ps 27:8-9)',
    collect: 'O God, who have commanded us to listen to your beloved Son, be pleased, we pray, to nourish us inwardly by your word, that, with spiritual sight made pure, we may rejoice to behold your glory. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, God, for ever and ever.',
    firstReading: const ReadingEntry(
      id: 'r1-1',
      heading: 'First Reading',
      ref: 'A reading from the Book of Genesis (Gen 15:5-12, 17-18)',
      title: 'The covenant God made with Abraham',
      text: 'The Lord God took Abram outside and said, "Look up at the sky and count the stars, if you can. Just so," he added, "shall your descendants be." Abram put his faith in the LORD, who credited it to him as an act of righteousness.',
      closing: 'The word of the Lord.',
    ),
    psalm: const PsalmEntry(
      id: 'r1-ps',
      ref: 'Psalm 27:1, 7-8, 8-9, 13-14',
      response: 'The Lord is my light and my salvation.',
      stanzas: [
        'The LORD is my light and my salvation;\nwhom should I fear?\nThe LORD is my life\'s refuge;\nof whom should I be afraid?',
        'Hear, O LORD, the sound of my call;\nhave pity on me, and answer me.\nOf you my heart speaks; you my glance seeks.',
        'Your presence, O LORD, I seek.\nHide not your face from me;\ndo not in anger repel your servant.',
        'I believe that I shall see the bounty of the LORD\nin the land of the living.\nWait for the LORD with courage.',
      ],
    ),
    secondReading: const ReadingEntry(
      id: 'r1-2',
      heading: 'Second Reading',
      ref: 'A reading from the Letter of Saint Paul to the Philippians (Phil 3:17–4:1)',
      title: 'Our citizenship is in heaven',
      text: 'Join with others in being imitators of me, brothers and sisters, and observe those who thus conduct themselves according to the model you have in us. But our citizenship is in heaven, and from it we also await a savior, the Lord Jesus Christ.',
      closing: 'The word of the Lord.',
    ),
    gospelAcclamation: const GospelAcclamation(
      alleluiaText: 'Praise and honor to you, Lord Jesus Christ!',
      ref: 'Matthew 17:5',
      verse: 'From the shining cloud the Father\'s voice was heard: "This is my beloved Son, hear him."',
    ),
    gospel: const ReadingEntry(
      id: 'r1-3',
      heading: 'Gospel',
      ref: 'A reading from the holy Gospel according to Luke (Lk 9:28b-36)',
      title: 'The Transfiguration of the Lord',
      text: 'Jesus took Peter, John, and James and went up the mountain to pray. While he was praying his face changed in appearance and his clothing became dazzling white. Then from the cloud came a voice that said, "This is my chosen Son; listen to him."',
      closing: 'The Gospel of the Lord.',
    ),
    prayerAfterCommunion: 'We pray, O Lord, that, having been nourished by this holy exchange, we may be transformed into what we have received. Through Christ our Lord. Amen.',
    todaysReflection: 'In today\'s Gospel, Jesus reveals his divine glory on the mountaintop. Like Peter, James, and John, we are invited to encounter the transfigured Christ in prayer, allowing his light to transform our hearts during this Lenten season.',
    personalDevotion: 'Spend 10 minutes in quiet prayer today. Ask the Lord to reveal one area of your life where you need to be transformed by his light.',
    status: ReadingStatus.published,
    createdAt: DateTime(2026, 2, 20, 8),
    updatedAt: DateTime(2026, 2, 20, 8),
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK USERS
// ─────────────────────────────────────────────────────────────────────────────
final List<BOUser> mockUsers = [
  BOUser(id: 'u1', firstName: 'Cynthia',  lastName: 'Anya',      email: 'cy@yopmail.com',         role: UserRole.contributor, createdAt: DateTime(2026, 2, 25)),
  BOUser(id: 'u2', firstName: 'Seth',     lastName: 'Rolas',     email: 'rola@yopmail.com',        role: UserRole.user,        createdAt: DateTime(2026, 2, 25)),
  BOUser(id: 'u3', firstName: 'Andrews',  lastName: 'Alexandra', email: 'alex@yopmail.com',        role: UserRole.admin,       createdAt: DateTime(2026, 2, 25)),
  BOUser(id: 'u4', firstName: 'Kingsley', lastName: 'Okoye',     email: 'kingsdanike@gmail.com',   phone: '08135425888', role: UserRole.superAdmin, createdAt: DateTime(2026, 2, 25)),
];

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK APPROVALS
// ─────────────────────────────────────────────────────────────────────────────
final List<ApprovalRequest> mockApprovals = [
  ApprovalRequest(
    id: 'a1', parishId: 'p1', parishName: 'Christ the King Catholic Church (CKC)',
    contributorId: 'u1', contributorName: 'Cynthia Anya', contributorEmail: 'cy@yopmail.com',
    type: ApprovalType.announcements,
    changes: {
      'announcements': ChangeEntry(
        oldValue: ['Confession every Saturday'],
        newValue: ['Confession every Saturday', 'New youth group starting April 2026'],
      ),
    },
    status: ApprovalStatus.pending,
    submittedAt: DateTime(2026, 3, 1, 10, 30),
  ),
  ApprovalRequest(
    id: 'a2', parishId: 'p2', parishName: 'St. Patrick Catholic Church',
    contributorId: 'u1', contributorName: 'Cynthia Anya', contributorEmail: 'cy@yopmail.com',
    type: ApprovalType.massTimes,
    changes: {
      'massTimes': ChangeEntry(oldValue: 'Sunday: 7AM, 10AM', newValue: 'Sunday: 7AM, 10AM, 12PM (new)'),
    },
    status: ApprovalStatus.pending,
    submittedAt: DateTime(2026, 3, 2, 14),
  ),
  ApprovalRequest(
    id: 'a3', parishId: 'p1', parishName: 'Christ the King Catholic Church (CKC)',
    contributorId: 'u1', contributorName: 'Cynthia Anya', contributorEmail: 'cy@yopmail.com',
    type: ApprovalType.parishInfo,
    changes: {
      'address': ChangeEntry(oldValue: '1 Church Road, Festac Town', newValue: '1 Church Road, Festac Town, Lagos State'),
      'website': ChangeEntry(oldValue: 'https://ckc-festac.org', newValue: 'https://ckc.catholic.ng'),
    },
    status: ApprovalStatus.approved,
    reviewedBy: 'Kingsley Okoye',
    reviewNote: 'Verified the new address with the parish secretary.',
    submittedAt: DateTime(2026, 2, 28, 9),
    reviewedAt:  DateTime(2026, 2, 28, 16),
  ),
  ApprovalRequest(
    id: 'a4', parishId: 'p2', parishName: 'St. Patrick Catholic Church',
    contributorId: 'u1', contributorName: 'Cynthia Anya', contributorEmail: 'cy@yopmail.com',
    type: ApprovalType.contacts,
    changes: {
      'phone': ChangeEntry(oldValue: '', newValue: '+234 801 234 5678'),
      'email': ChangeEntry(oldValue: '', newValue: 'stpatrick@catholic.ng'),
    },
    status: ApprovalStatus.rejected,
    reviewedBy: 'Andrews Alexandra',
    reviewNote: 'Could not verify contact information provided.',
    submittedAt: DateTime(2026, 2, 27, 11),
    reviewedAt:  DateTime(2026, 2, 27, 15),
  ),
];

// ─────────────────────────────────────────────────────────────────────────────
//  REFERENCE DATA
// ─────────────────────────────────────────────────────────────────────────────
const List<String> countries = [
  'Nigeria', 'Ghana', 'Kenya', 'Uganda', 'South Africa', 'United States', 'United Kingdom',
];

const Map<String, List<String>> archdioceses = {
  'Nigeria':        ['Abuja', 'Lagos', 'Onitsha', 'Ibadan', 'Benin City', 'Kaduna', 'Port Harcourt'],
  'Ghana':          ['Accra', 'Cape Coast', 'Kumasi'],
  'Kenya':          ['Nairobi', 'Mombasa', 'Kisumu'],
  'United States':  ['New York', 'Los Angeles', 'Chicago', 'Boston', 'Washington DC'],
  'United Kingdom': ['Westminster', 'Birmingham', 'Liverpool', 'Southwark'],
};

const Map<String, List<String>> deaneries = {
  'Lagos':  ['Festac', 'Ikeja', 'Lagos Island', 'Surulere', 'Victoria Island', 'Ikorodu', 'Apapa'],
  'Abuja':  ['Central', 'Garki', 'Wuse', 'Maitama', 'Gwarinpa'],
  'Accra':  ['Accra Central', 'Tema', 'Accra East'],
};
