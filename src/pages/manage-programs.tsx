import { CONFIG } from 'src/config-global';

import { ManageProgramsView } from 'src/sections/programs';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Manage Programs - ${CONFIG.appName}`}</title>

      <ManageProgramsView />
    </>
  );
}
