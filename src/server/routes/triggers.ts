import { Hono } from 'hono';
import type { OnAppInstallRequest, OnPostSubmitRequest, TriggerResponse } from '@devvit/web/shared';
import { context, reddit, settings } from '@devvit/web/server';
import { createPost } from '../core/post';
import { isUserVerifiedToPost } from '../helpers';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  try {
    const post = await createPost();
    const input = await c.req.json<OnAppInstallRequest>();

    return c.json<TriggerResponse>(
      {
        status: 'success',
        message: `Post created in subreddit ${context.subredditName} with id ${post.id} (trigger: ${input.type})`,
      },
      200
    );
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    return c.json<TriggerResponse>(
      {
        status: 'error',
        message: 'Failed to create post',
      },
      400
    );
  }
});

triggers.post('/on-post-submit', async (c) => {
  const input = await c.req.json<OnPostSubmitRequest>();
  if (!input) return;

  if (await settings.get('verifiedEnabled')) {
    await removeUnverifiedPostsSubreddit(input);
  }

  return c.json<TriggerResponse>({
      status: 'success'
    },
    200
  );
});

async function removeUnverifiedPostsSubreddit(input: OnPostSubmitRequest): Promise<void> {
  const subredditName = input.subreddit?.name;
  const username = input.author?.name;
  if (!subredditName || !username) return;
  
  // Get user's post karma for bypass if configured
  if (await isUserVerifiedToPost(subredditName, username)) return;

  const postId = input.post?.id as `t3_${string}`;
  const post = await reddit.getPostById(postId);
  if (!postId || !post) return;

  const subredditPostKarmaConfig = await settings.get('verifiedKarma') as number;
  const removalReason = 
  `
  Hello,

  r/${subredditName} has the following requirements before you can post in this subreddit:
  * Pass an approval quiz ${subredditPostKarmaConfig > 0 
    ? 'or have subreddit post karma at or above **'+ subredditPostKarmaConfig +'**' 
    : ''}

  Once you reach these requirements you may repost this post.

  Thank you,
  r/${subredditName} moderation team
  `;

  const comment = await reddit.submitComment({
    id: postId,
    text: removalReason,
    runAs: 'APP'
  });
  await comment.distinguish(true);

  await post.remove();
  await post.lock();

  return;
}
