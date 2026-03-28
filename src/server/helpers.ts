import { reddit } from '@devvit/web/server';

export async function isUserModerator(subreddit: string, username: string) {
    const isModerator = (await reddit.getModerators({
        subredditName: subreddit,
        username: username
    }).all()).length > 0;

    return isModerator;
}

export async function isUserApproved(subreddit: string, username: string) {
    const isApproved = (await reddit.getApprovedUsers({
        subredditName: subreddit,
        username: username
    }).all()).length > 0;

    return isApproved;
}