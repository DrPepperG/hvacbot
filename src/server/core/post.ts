import { reddit } from '@devvit/web/server';

export const createPost = async () => {
  const post = await reddit.submitCustomPost({
    title: 'Want to post? Verify here!'
  });

  await post.distinguish();
  await post.sticky(1)

  return post
};
