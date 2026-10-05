export const faqs: { q: string; a: string }[] = [
  {
    q: 'Is Manazil free?',
    a: 'Yes. Manazil is free, with no ads and no account.',
  },
  {
    q: 'Which phones does it run on?',
    a: 'iPhone, iPad and Android phones. It is not in the stores yet. This site will link to them when it is.',
  },
  {
    q: 'Where do the prayer times come from?',
    a: 'For each island, from the tables of the Maldives Islamic Ministry, using the island data from the Namaadhu app. You can also use your location instead of choosing an island.',
  },
  {
    q: 'Does it work without internet?',
    a: 'Reading the Quran, prayer times, Qibla and reminders work without internet. Recitation audio and Verse Finder need a connection, and the page-by-page Mushaf loads its fonts over the internet.',
  },
  {
    q: 'Which translations are in the app?',
    a: 'Dhivehi, from the Office of the President of Maldives (Abu Bakr Ibrahim Ali, Bakurube), and English, Saheeh International.',
  },
  {
    q: 'Why does Qibla show a number and a still dial on my phone?',
    a: 'Some phones have no compass sensor, so the dial cannot turn with you. Manazil then shows the Qibla bearing as a number from true north. Find north with a compass, a map or the sun, then face the Kaaba mark on the dial. Phones with a compass get the live dial.',
  },
  {
    q: 'The compass says its accuracy is low. What do I do?',
    a: 'Move the phone in a figure of eight a few times, and keep it away from metal and magnets.',
  },
  {
    q: 'What does Verse Finder send, and to whom?',
    a: 'Only after you tap the orb, it records up to 20 seconds. The recording goes to a server function we run on Supabase, which forwards it to OpenAI’s speech-to-text service to turn it into Arabic text. The recording is deleted from your phone as soon as it is sent, and we do not save it. Manazil asks before the first use. The full detail is in the privacy policy.',
  },
  {
    q: 'Does Manazil use my location?',
    a: 'Yes, for the Qibla compass and, if you choose “My location”, for prayer times. It is used and saved on your phone only, and is never sent to us.',
  },
  {
    q: 'I found a mistake. How do I tell you?',
    a: 'Email hshazil@gmail.com with what you saw and which phone you use.',
  },
];
