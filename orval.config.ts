import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'https://meetings-quality-api.onrender.com/generated/openapi.json',
      
      // Or use local file if backend is in same monorepo:
      // target: '../meetings-quality-api/generated/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      client: 'react-query',
      baseUrl: 'https://meetings-quality-api.onrender.com',
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