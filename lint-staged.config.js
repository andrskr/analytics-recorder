export default {
  '**/!(*.ts?(x)|*.cjs)': 'pnpm format:fix',
  '**/*{.ts?(x),.cjs}': ['pnpm format:fix', 'pnpm lint:fix'],
};
