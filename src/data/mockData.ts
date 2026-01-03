import { User, Community, Post, Comment } from '@/types';

export const mockUsers: User[] = [
    {
        id: '1',
        username: 'techEnthusiast',
        karma: 15420,
        createdAt: new Date('2022-03-15'),
    },
    {
        id: '2',
        username: 'creativeMind',
        karma: 8750,
        createdAt: new Date('2023-01-20'),
    },
    {
        id: '3',
        username: 'newsHunter',
        karma: 32100,
        createdAt: new Date('2021-06-10'),
    },
    {
        id: '4',
        username: 'gamingPro',
        karma: 22890,
        createdAt: new Date('2022-09-05'),
    },
    {
        id: '5',
        username: 'scienceNerd',
        karma: 45600,
        createdAt: new Date('2020-11-12'),
    },
];

export const mockCommunities: Community[] = [
    {
        id: '1',
        name: 'technology',
        displayName: 'Technology',
        description: 'Subreddit dedicated to the news and discussions about the creation and use of technology.',
        members: 14200000,
        createdAt: new Date('2008-01-25'),
    },
    {
        id: '2',
        name: 'programming',
        displayName: 'Programming',
        description: 'Computer Programming discussions and news.',
        members: 5800000,
        createdAt: new Date('2009-03-15'),
    },
    {
        id: '3',
        name: 'gaming',
        displayName: 'Gaming',
        description: 'A subreddit for (almost) anything related to games - video games, board games, card games, etc.',
        members: 35600000,
        createdAt: new Date('2008-03-18'),
    },
    {
        id: '4',
        name: 'worldnews',
        displayName: 'World News',
        description: 'A place for major news from around the world.',
        members: 32100000,
        createdAt: new Date('2008-01-25'),
    },
    {
        id: '5',
        name: 'science',
        displayName: 'Science',
        description: 'The science subreddit. Your source for the latest science news and discussion.',
        members: 29800000,
        createdAt: new Date('2008-03-14'),
    },
    {
        id: '6',
        name: 'movies',
        displayName: 'Movies',
        description: 'The goal of r/Movies is to provide an inclusive place for discussions and news about films.',
        members: 28500000,
        createdAt: new Date('2008-01-25'),
    },
    {
        id: '7',
        name: 'music',
        displayName: 'Music',
        description: 'The musical community of Reddit.',
        members: 31200000,
        createdAt: new Date('2008-02-26'),
    },
    {
        id: '8',
        name: 'askreddit',
        displayName: 'Ask Reddit',
        description: 'r/AskReddit is the place to ask and answer thought-provoking questions.',
        members: 45000000,
        createdAt: new Date('2008-01-25'),
    },
];

export const mockPosts: Post[] = [
    {
        id: '1',
        title: 'Just released my first open-source AI tool - would love your feedback!',
        content: 'After 6 months of development, I finally released my first open-source project. It\'s an AI-powered code review tool that helps developers catch bugs before they hit production. Built with Python and uses GPT-4 under the hood. Would love to hear what you all think and any suggestions for improvement!',
        author: mockUsers[0],
        community: mockCommunities[1],
        upvotes: 2847,
        downvotes: 124,
        commentCount: 342,
        createdAt: new Date(Date.now() - 3600000 * 2),
        isOC: true,
    },
    {
        id: '2',
        title: 'Breaking: Major tech company announces revolutionary quantum computing breakthrough',
        content: 'In a landmark announcement today, researchers have achieved quantum supremacy with a new 1000-qubit processor that maintains coherence for over 10 minutes. This could revolutionize cryptography, drug discovery, and climate modeling.',
        author: mockUsers[2],
        community: mockCommunities[0],
        upvotes: 15420,
        downvotes: 890,
        commentCount: 1847,
        createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
        id: '3',
        title: 'After 2 years of development, our indie game is finally on Steam!',
        content: 'My small team of 3 developers just launched our dream project on Steam! It\'s a roguelike deckbuilder with a unique time-manipulation mechanic. We poured our hearts into this game and would love for you to check it out. AMA about indie game development!',
        author: mockUsers[3],
        community: mockCommunities[2],
        upvotes: 8934,
        downvotes: 312,
        commentCount: 756,
        createdAt: new Date(Date.now() - 3600000 * 8),
        isOC: true,
    },
    {
        id: '4',
        title: 'Scientists discover high potential high-temperature superconductor that works at room temperature',
        content: 'A team of researchers from MIT and Stanford have published peer-reviewed results showing superconductivity at 21°C (70°F) under normal atmospheric pressure. If verified, this could transform energy transmission and computing.',
        author: mockUsers[4],
        community: mockCommunities[4],
        upvotes: 28745,
        downvotes: 1203,
        commentCount: 3421,
        createdAt: new Date(Date.now() - 3600000 * 12),
    },
    {
        id: '5',
        title: 'What\'s a skill that took you way too long to learn but changed your life?',
        content: 'For me, it was learning to say "no" to things. Growing up, I was always a people-pleaser, but once I learned to prioritize my own time and energy, everything changed. What about you all?',
        author: mockUsers[1],
        community: mockCommunities[7],
        upvotes: 12543,
        downvotes: 567,
        commentCount: 8932,
        createdAt: new Date(Date.now() - 3600000 * 18),
    },
    {
        id: '6',
        title: 'New Christopher Nolan film announced - First details revealed',
        content: 'Warner Bros has officially announced Christopher Nolan\'s next project. The film will explore the early days of space exploration with a star-studded cast. Production begins next spring with a 2026 release date.',
        author: mockUsers[2],
        community: mockCommunities[5],
        upvotes: 6789,
        downvotes: 234,
        commentCount: 892,
        createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
        id: '7',
        title: 'Found this hidden gem album from 1975 - Absolutely mind-blowing production',
        content: 'Was digging through my late grandfather\'s vinyl collection and discovered this obscure prog rock album. The production quality is insane for its time. Sharing the Spotify link for anyone interested in discovering something truly special.',
        author: mockUsers[1],
        community: mockCommunities[6],
        upvotes: 3456,
        downvotes: 123,
        commentCount: 234,
        createdAt: new Date(Date.now() - 3600000 * 36),
    },
    {
        id: '8',
        title: 'G7 Summit: World leaders agree on historic climate action plan',
        content: 'In an unprecedented move, G7 nations have committed to achieving net-zero emissions by 2040, ahead of previous targets. The agreement includes $500 billion in green energy investments and new carbon pricing mechanisms.',
        author: mockUsers[2],
        community: mockCommunities[3],
        upvotes: 18923,
        downvotes: 2341,
        commentCount: 4521,
        createdAt: new Date(Date.now() - 3600000 * 48),
    },
];

export const mockComments: Comment[] = [
    {
        id: '1',
        content: 'This is amazing! I\'ve been looking for something exactly like this. How does it handle large codebases?',
        author: mockUsers[1],
        postId: '1',
        upvotes: 234,
        downvotes: 12,
        createdAt: new Date(Date.now() - 3600000),
        replies: [
            {
                id: '2',
                content: 'Great question! It processes files in chunks and uses caching to handle repos with 100k+ lines efficiently.',
                author: mockUsers[0],
                postId: '1',
                parentId: '1',
                upvotes: 189,
                downvotes: 5,
                createdAt: new Date(Date.now() - 3500000),
            },
        ],
    },
    {
        id: '3',
        content: 'If this holds up to peer review, we\'re looking at a Nobel Prize-worthy discovery.',
        author: mockUsers[4],
        postId: '2',
        upvotes: 1523,
        downvotes: 89,
        createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
        id: '4',
        content: 'Congrats on the launch! The art style looks incredible. Adding to my wishlist!',
        author: mockUsers[0],
        postId: '3',
        upvotes: 567,
        downvotes: 23,
        createdAt: new Date(Date.now() - 3600000 * 6),
    },
];

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

export function formatTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
    return `${Math.floor(seconds / 31536000)}y ago`;
}
