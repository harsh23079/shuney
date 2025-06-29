// data/mockData.js

export const mockCreators = [
    {
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        playlistCreatorName: "Varun Sharma",
        thumbnailId: "varun-thumb-id",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistCreatorId: "creator2",
        playlistCreatorName: "Jaya Kishori",
        thumbnailId: "jaya-thumb-id",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistCreatorId: "creator3",
        playlistCreatorName: "Sandeep Maheshwari",
        thumbnailId: "sandeep-thumb-id",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistCreatorId: "creator4",
        playlistCreatorName: "Dhruv Rathee",
        thumbnailId: "dhruv-thumb-id",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const mockTopics = [
    {
        playlistTopicId: "topic1",
        playlistTopicName: "Dharm Yudh",
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        thumbnailId: "dharm-yudh-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic2",
        playlistTopicName: "Karm Yudh",
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        thumbnailId: "karm-yudh-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic3",
        playlistTopicName: "Youtube Class",
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        thumbnailId: "youtube-class-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic4",
        playlistTopicName: "Religions",
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        thumbnailId: "religions-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic5",
        playlistTopicName: "Shunye Dhrishti",
        playlistCreatorId: "NKxBLFqymBOA6livS5Rp",
        thumbnailId: "shunye-dhrishti-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Add topics for other creators
    {
        playlistTopicId: "topic6",
        playlistTopicName: "Devotional Songs",
        playlistCreatorId: "creator2",
        thumbnailId: "devotional-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic7",
        playlistTopicName: "Motivation",
        playlistCreatorId: "creator3",
        thumbnailId: "motivation-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistTopicId: "topic8",
        playlistTopicName: "Political Analysis",
        playlistCreatorId: "creator4",
        thumbnailId: "political-thumb",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const mockPlaylists = [
    // Varun Sharma playlists
    {
        playlistId: "playlist1",
        playlistName: "Introduction to Dharm Yudh",
        playlistTopicId: "topic1",
        bigImageId: "big-dharm-1",
        smallImageId: "small-dharm-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistId: "playlist2",
        playlistName: "Advanced Dharm Concepts",
        playlistTopicId: "topic1",
        bigImageId: "big-dharm-2",
        smallImageId: "small-dharm-2",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistId: "playlist3",
        playlistName: "Karm Theory Basics",
        playlistTopicId: "topic2",
        bigImageId: "big-karm-1",
        smallImageId: "small-karm-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistId: "playlist4",
        playlistName: "YouTube Strategy 101",
        playlistTopicId: "topic3",
        bigImageId: "big-youtube-1",
        smallImageId: "small-youtube-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Other creators playlists
    {
        playlistId: "playlist5",
        playlistName: "Morning Bhajans",
        playlistTopicId: "topic6",
        bigImageId: "big-bhajan-1",
        smallImageId: "small-bhajan-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistId: "playlist6",
        playlistName: "Success Mindset",
        playlistTopicId: "topic7",
        bigImageId: "big-success-1",
        smallImageId: "small-success-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const mockVideos = [
    // Dharm Yudh Introduction playlist videos
    {
        playlistVideoId: "video1",
        playlistVideoName: "What is Dharm? - Episode 1",
        playlistId: "playlist1",
        streamVideoId: "stream-id-1",
        thumbnailId: "video-thumb-1",
        duration: 1800000, // 30 minutes in milliseconds
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistVideoId: "video2",
        playlistVideoName: "Understanding Yudh - Episode 2",
        playlistId: "playlist1",
        streamVideoId: "stream-id-2",
        thumbnailId: "video-thumb-2",
        duration: 2100000, // 35 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistVideoId: "video3",
        playlistVideoName: "Modern Applications - Episode 3",
        playlistId: "playlist1",
        streamVideoId: "stream-id-3",
        thumbnailId: "video-thumb-3",
        duration: 1500000, // 25 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Advanced Dharm Concepts playlist videos
    {
        playlistVideoId: "video4",
        playlistVideoName: "Deep Dive into Dharm Philosophy",
        playlistId: "playlist2",
        streamVideoId: "stream-id-4",
        thumbnailId: "video-thumb-4",
        duration: 2400000, // 40 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistVideoId: "video5",
        playlistVideoName: "Practical Dharm in Daily Life",
        playlistId: "playlist2",
        streamVideoId: "stream-id-5",
        thumbnailId: "video-thumb-5",
        duration: 1800000, // 30 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Karm Theory playlist videos
    {
        playlistVideoId: "video6",
        playlistVideoName: "Understanding Karm Basics",
        playlistId: "playlist3",
        streamVideoId: "stream-id-6",
        thumbnailId: "video-thumb-6",
        duration: 2700000, // 45 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistVideoId: "video7",
        playlistVideoName: "Karm and Consequences",
        playlistId: "playlist3",
        streamVideoId: "stream-id-7",
        thumbnailId: "video-thumb-7",
        duration: 2100000, // 35 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // YouTube Strategy playlist videos
    {
        playlistVideoId: "video8",
        playlistVideoName: "Starting Your YouTube Channel",
        playlistId: "playlist4",
        streamVideoId: "stream-id-8",
        thumbnailId: "video-thumb-8",
        duration: 1200000, // 20 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    // Other creators videos
    {
        playlistVideoId: "video9",
        playlistVideoName: "Om Namah Shivaya",
        playlistId: "playlist5",
        streamVideoId: "stream-id-9",
        thumbnailId: "video-thumb-9",
        duration: 900000, // 15 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        playlistVideoId: "video10",
        playlistVideoName: "Believe in Yourself",
        playlistId: "playlist6",
        streamVideoId: "stream-id-10",
        thumbnailId: "video-thumb-10",
        duration: 1800000, // 30 minutes
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
