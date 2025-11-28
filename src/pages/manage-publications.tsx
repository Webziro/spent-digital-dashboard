import { CONFIG } from 'src/config-global';

import { ManagePublicationsView } from 'src/sections/publications/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Manage Publications - ${CONFIG.appName}`}</title>

      <ManagePublicationsView />
    </>
  );
}
