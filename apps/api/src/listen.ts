import { API_TRPC_BASE_ROUTE } from "@optee/constants";
import { environment } from "@optee/env";
import app from ".";

const port = environment.apiPort;

if (!port) {
  throw new Error(
    "environment.apiPort is not set. Required in development to run the server locally. Set it to 3000 in your .env file.",
  );
}

app.listen(port, () => {
  console.log(`🚀 API Server running on http://localhost:${port}`);
  console.log(
    `🔧 tRPC endpoint: http://localhost:${port}${API_TRPC_BASE_ROUTE}`,
  );
});

export default app;
