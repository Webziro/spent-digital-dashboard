import { CONFIG } from 'src/config-global';

import { ManageResearchView } from 'src/sections/research/view/manage-research-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Manage-Research - ${CONFIG.appName}`}</title>

      <ManageResearchView />
    </>
  );
}



