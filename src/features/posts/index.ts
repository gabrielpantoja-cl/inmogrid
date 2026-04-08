// Barrel público del feature `posts`.

export {
  listPostsByUser,
  getPostByIdForUser,
  createPostForUser,
  updatePostForUser,
  deletePostForUser,
} from './lib/queries';

export {
  createPostSchema,
  updatePostSchema,
  POST_LIST_SELECT,
  POST_DETAIL_SELECT,
  type CreatePostInput,
  type UpdatePostInput,
} from './lib/validations';

export { generateSlug, estimateReadTime } from './lib/slug';
