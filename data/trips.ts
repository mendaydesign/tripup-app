export type Traveller = {
  id: string;
  initials: string;
  color: string;
  name?: string;
};

export type FeedItemData =
  | { id: string; type: 'poll'; title: string; subtitle: string; timestamp: string }
  | { id: string; type: 'expense'; title: string; subtitle: string; timestamp: string; paidAvatars: Traveller[] }
  | { id: string; type: 'photo'; title: string; subtitle: string; timestamp: string }
  | { id: string; type: 'participant'; title: string; subtitle: string; timestamp: string };

export type TripDate = {
  day: string;
  month: string;
  notificationCount?: number;
};

export type ItineraryEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  time: string;
  iconType: 'surf' | 'lunch' | 'beach' | 'hotel';
  isNew?: boolean;
};

export type IncomingExpense = {
  id: string;
  name: string;
  total: number;
  yourShare: number;
  paidBy: Traveller;
  travellers: Traveller[];
};

export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

export type PollOption = {
  id: string;
  text: string;
  votes: string[]; // traveller IDs who voted for this option
};

export type ActivePoll = {
  id: string;
  question: string;
  options: PollOption[];
  itineraryDate: string;  // e.g. "09"
  itineraryTime: string;  // e.g. "8pm"
  addToItinerary: boolean;
  resolved: boolean;
  winnerId?: string;
};

export type Trip = {
  id: string;
  name: string;
  travellers: Traveller[];
  todayActivityCount: number;
  todayDate: { day: string; month: string };
  feedItems: FeedItemData[];
  tripDates: TripDate[];
  itineraryEvents: ItineraryEvent[];
  chatMessages: ChatMessage[];
  incomingExpenses: IncomingExpense[];
};

export const mockTrip: Trip = {
  id: '1',
  name: 'Lisbon Group',
  travellers: [
    { id: '1', initials: 'AR', color: '#FF9944', name: 'Ari' },
    { id: '2', initials: 'LJ', color: '#44AAFF', name: 'Lily Juggins' },
    { id: '3', initials: 'NC', color: '#FA9DFD', name: 'Nic' },
    { id: '4', initials: 'AS', color: '#CF9DFD', name: 'Aidan Stephenson' },
    { id: '5', initials: 'CS', color: '#14AE5C', name: 'Courtney Smith' },
  ],
  todayActivityCount: 5,
  todayDate: { day: '09', month: 'Jun' },
  tripDates: [
    { day: '06', month: 'Jun' },
    { day: '07', month: 'Jun' },
    { day: '08', month: 'Jun' },
    { day: '09', month: 'Jun' },
    { day: '10', month: 'Jun' },
    { day: '11', month: 'Jun' },
    { day: '12', month: 'Jun' },
  ],
  itineraryEvents: [
    { id: 'e1', date: '09', title: 'Surfing Lessons', subtitle: '5 Travellers attending surfing lessons at Lisbon Bay', time: '10am', iconType: 'surf' },
    { id: 'e2', date: '09', title: 'Lunch', subtitle: 'Booked lunch at the bay', time: '1pm', iconType: 'lunch' },
    { id: 'e3', date: '09', title: 'Relax at beach', subtitle: 'Kick our feet up at the beach until dinner!', time: '2pm', iconType: 'beach' },
    { id: 'e4', date: '09', title: 'Back to the hotel', subtitle: 'Time to get ready for our night out!', time: '5pm', iconType: 'hotel' },
    { id: 'e6', date: '09', title: 'Back to the hotel', subtitle: 'Time to get ready for our night out!', time: '10pm', iconType: 'hotel' },
  ],
  chatMessages: [
    { id: 'c1', senderId: '2', text: "Last night everyone 😭 can't believe how fast this week has gone", timestamp: '19:04' },
    { id: 'c2', senderId: '3', text: "Genuinely one of the best trips I've ever been on", timestamp: '19:05' },
    { id: 'c3', senderId: '4', text: "The surfing this morning was unreal — still buzzing from it", timestamp: '19:05' },
    { id: 'c4', senderId: '5', text: "Same! And that sunset from Miradouro last night... I'm not ready to go home 😩", timestamp: '19:06' },
    { id: 'c5', senderId: '1', text: "Flight's at 7am though so we can't go too crazy tonight 😅", timestamp: '19:08' },
    { id: 'c6', senderId: '2', text: "Speak for yourself 😂 what are we thinking for tonight?", timestamp: '19:09' },
    { id: 'c7', senderId: '4', text: "We HAVE to do a proper last dinner — somewhere special", timestamp: '19:09' },
    { id: 'c8', senderId: '3', text: "100% — somewhere with a view. We deserve it after this week", timestamp: '19:10' },
    { id: 'c9', senderId: '5', text: "Yes! Any ideas? There's that rooftop place near the waterfront", timestamp: '19:11' },
    { id: 'c10', senderId: '1', text: "Let me set up a poll — everyone vote on where we go for our last dinner 🗳️", timestamp: '19:12' },
  ],
  feedItems: [
    {
      id: 'feed-lily-surf',
      type: 'expense',
      title: 'Expense Request: Surfing Lessons',
      subtitle: 'Lily paid £150 for the group',
      timestamp: 'Now',
      paidAvatars: [
        { id: '1', initials: 'AR', color: '#FF9944' },
        { id: '2', initials: 'LJ', color: '#44AAFF' },
        { id: '3', initials: 'NC', color: '#FA9DFD' },
        { id: '4', initials: 'AS', color: '#CF9DFD' },
        { id: '5', initials: 'CS', color: '#14AE5C' },
      ],
    },
  ],
  incomingExpenses: [
    {
      id: 'inc1',
      name: 'Surfing Lessons',
      total: 150,
      yourShare: 30,
      paidBy: { id: '2', initials: 'LJ', color: '#44AAFF', name: 'Lily Juggins' },
      travellers: [
        { id: '1', initials: 'AR', color: '#FF9944', name: 'Ari' },
        { id: '2', initials: 'LJ', color: '#44AAFF', name: 'Lily Juggins' },
        { id: '3', initials: 'NC', color: '#FA9DFD', name: 'Nic' },
        { id: '4', initials: 'AS', color: '#CF9DFD', name: 'Aidan Stephenson' },
        { id: '5', initials: 'CS', color: '#14AE5C', name: 'Courtney Smith' },
      ],
    },
  ],
};
