export default {
  async up(knex) {
    await knex('directus_settings').insert({
      project_name: 'Study-Quiz',
      project_url: null,
      project_color: '#6644FF',
      project_logo: null,
      public_foreground: null,
      public_background: null,
      public_note: null,
      auth_login_attempts: 25,
      auth_password_policy: '/^.{8,}$/',
      storage_asset_transform: 'all',
      storage_asset_presets: null,
      custom_css: null,
      storage_default_folder: null,
      basemaps: null,
      mapbox_key: null,
      module_bar: JSON.stringify([
        { type: 'module', id: 'content', enabled: true },
        { type: 'module', id: 'users', enabled: true },
        { type: 'module', id: 'files', enabled: true },
        { type: 'module', id: 'insights', enabled: true },
        { type: 'module', id: 'docs', enabled: true },
        { type: 'module', id: 'settings', enabled: true, locked: true },
      ]),
      project_descriptor: null,
      default_language: 'en-US',
      custom_aspect_ratios: null,
    });
  },
};
