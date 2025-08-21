import dbConnect from './mongodb';

/**
 * Test the database connection
 * This utility can be used to verify that the MongoDB connection is working properly
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await dbConnect();
    console.log('✅ Database connection successful');
    console.log(`Connected to: ${connection.connection.name}`);
    console.log(`Connection state: ${connection.connection.readyState}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

/**
 * Get database connection info
 */
export async function getDatabaseInfo() {
  try {
    const connection = await dbConnect();
    return {
      name: connection.connection.name,
      host: connection.connection.host,
      port: connection.connection.port,
      readyState: connection.connection.readyState,
      readyStateString: getReadyStateString(connection.connection.readyState),
    };
  } catch (error) {
    throw new Error(`Failed to get database info: ${error}`);
  }
}

/**
 * Convert mongoose connection ready state to human-readable string
 */
function getReadyStateString(state: number): string {
  switch (state) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}
