import { reddit, settings } from '@devvit/web/server';

export async function isUserModerator(subredditName: string, username: string) {
    const isModerator = (await reddit.getModerators({
        subredditName: subredditName,
        username: username
    }).all()).length > 0;

    return isModerator;
}

export async function isUserApproved(subredditName: string, username: string) {
    const isApproved = (await reddit.getApprovedUsers({
        subredditName: subredditName,
        username: username
    }).all()).length > 0;

    return isApproved;
}

export async function isUserVerifiedToPost(subredditName: string, username: string) {
    const userSubredditPostKarma = (await reddit.getUserKarmaFromCurrentSubreddit(username)).fromPosts;

    const userIsApproved = await isUserApproved(subredditName, username);
    const userIsModerator = await isUserModerator(subredditName, username);
    if (userIsApproved || userIsModerator) return true;

    const subredditPostKarmaConfig = await settings.get('verifiedKarma') as number;
    if (subredditPostKarmaConfig <= Number(userSubredditPostKarma)) return true;

    return false;
}