import { BadRequest } from '../../../lib/exceptions.js';

export default ({ filter }, { services }) => {
  const { ItemsService, UsersService } = services;

  filter('users.delete', async (keys, _, { schema, accountability }) => {
    if (keys.length > 1) {
      throw new BadRequest('Multi requests not supported');
    }

    const userService = new UsersService({ schema, accountability });
    const user = await userService.readOne(keys[0]);

    if (user.id !== accountability.user) {
      throw new BadRequest('Users can only delete themself');
    }

    const topicsService = new ItemsService('topics', { schema, accountability });
    await topicsService.deleteByQuery({
      filter: {
        user_created: { _eq: user.id },
      },
    });

    return keys;
  });
};
