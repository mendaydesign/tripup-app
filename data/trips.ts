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

export type Trip = {
  id: string;
  name: string;
  travellers: Traveller[];
  todayActivityCount: number;
  todayDate: { day: string; month: string };
  feedItems: FeedItemData[];
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
