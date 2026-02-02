import app from './app';
import { config } from './config/environment';

const startServer = () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port} in ${config.env} mode`);
      console.log(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
