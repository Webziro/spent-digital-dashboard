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


//Create new Research
//Title: AI in Research
//Abstract: Exploring the impact of artificial intelligence on modern research practices.
//summary: A brief overview of how AI is transforming research methodologies across various fields.
//Description: This publication explores the integration of artificial intelligence in research, highlighting its benefits and challenges. The document delves into case studies where AI has significantly enhanced research outcomes, discussing tools and techniques employed.
//Category: Research Paper
//Tags: AI, Research, Technology
//PDF URL: https://example.com/ai-research.pdf
//Published Date: 2024-05-15  

