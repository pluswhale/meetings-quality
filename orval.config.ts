import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'https://meetings-quality-api.onrender.com/api/docs/json',
      // If your API has OpenAPI/Swagger docs at a different endpoint, update this
      // Alternative: './openapi.json' if you have a local file
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'react-query',
      baseUrl: 'https://meetings-quality-api.onrender.com/api',
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
