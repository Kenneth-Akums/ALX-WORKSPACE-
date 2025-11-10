import "dotenv/config";
import app from '../api/index.js';

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`[server] API server listening on http://localhost:${PORT}`);
});
