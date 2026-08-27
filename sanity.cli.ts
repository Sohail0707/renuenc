import {defineCliConfig} from 'sanity/cli'
import 'dotenv/config'

/**
 * Only used by the `npx sanity …` command line (CORS setup, schema validation,
 * token management). The site and the embedded Studio do not read this file.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET,
  },
})
