import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../backend/generated/openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      mock: false,
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customAxiosInstance',
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
