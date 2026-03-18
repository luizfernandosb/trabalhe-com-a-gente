import { env } from './config/env.js';
import { app } from './app.js';

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend ativo na porta ${env.PORT}`);
});
