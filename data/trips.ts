export type Traveller = {
  id: string;
  initials: string;
  color: string;
  name?: string;
};

export type FeedItemData =
  | { id: string; type: 'poll'; title: string; subtitle: string; timestamp: string }
  | { id: string; type: 'expense'; title: string; subtitle: string; timestamp: string; paidAvatars: Traveller[] }
  | { id: string; type: 'photo'; title: string; subtitle: string; timestamp: string };

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
};

export const mockTrip: Trip = {
  id: '1',
  name: 'Lisbon Group',
  travellers: [
    { id: '1', initials: 'HM', color: '#FF9944', name: 'Harry Menday' },
    { id: '2', initials: 'LJ', color: '#44AAFF', name: 'Lily Juggins' },
    { id: '3', initials: 'JB', color: '#FA9DFD', name: 'Joe Boustead' },
    { id: '4', initials: 'AS', color: '#CF9DFD', name: 'Aidan Stephenson' },
    { id: '5', initials: 'CS', color: '#14AE5C', name: 'Courtney Smith' },
  ],
  todayActivityCount: 5,
  todayDate: { day: '09', month: 'Jun' },
  tripDates: [
    { day: '06', month: 'Jun' },
    { day: '07', month: 'Jun' },
    { day: '08', month: 'Jun' },
    { day: '09', month: 'Jun', notificationCount: 1 },
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
    { id: 'c1', senderId: '2', text: "Can't believe we're actually going to Lisbon next week! 🎉", timestamp: '09:12' },
    { id: 'c2', senderId: '3', text: "Same! I've been counting down. What's the plan for day one?", timestamp: '09:13' },
    { id: 'c3', senderId: '4', text: "I vote we head straight to the beach 🏖️", timestamp: '09:13' },
    { id: 'c4', senderId: '5', text: "Seconded — drop bags, go straight to Cascais ☀️", timestamp: '09:14' },
    { id: 'c5', senderId: '1', text: "I'm in. Also has everyone sorted their flights?", timestamp: '09:15' },
    { id: 'c6', senderId: '2', text: "We're all on the same one right? Heathrow at 7am", timestamp: '09:16' },
    { id: 'c7', senderId: '4', text: "🫡 Confirmed!", timestamp: '09:16' },
    { id: 'c8', senderId: '3', text: "Me too — see you all in the departures queue 😂", timestamp: '09:17' },
    { id: 'c9', senderId: '5', text: "Can't wait! What are we thinking for dinner that first night?", timestamp: '09:18' },
    { id: 'c10', senderId: '1', text: "Good shout — I'll set up a poll so we can all vote on where to go 🗳️", timestamp: '09:20' },
  ],
  feedItems: [
    {
      id: '1',
      type: 'poll',
      title: 'Poll Created',
      subtitle: 'Ari created a poll for the group.',
      timestamp: 'Now',
    },
    {
      id: '2',
      type: 'expense',
      title: 'Expense Request: Dinner',
      subtitle: 'Paid 5/5',
      timestamp: '5m',
      paidAvatars: [
        { id: 'p1', initials: 'AR', color: '#FF9944' },
        { id: 'p2', initials: 'LM', color: '#44AAFF' },
        { id: 'p3', initials: 'KR', color: '#FA9DFD' },
        { id: 'p4', initials: 'JD', color: '#CF9DFD' },
        { id: 'p5', initials: 'SM', color: '#14AE5C' },
      ],
    },
    {
      id: '3',
      type: 'photo',
      title: 'Lily added 5 photos.',
      subtitle: '5 new photos have been uploaded to the gallery.',
      timestamp: '12m',
    },
  ],
};
