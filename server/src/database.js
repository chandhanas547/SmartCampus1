import mongoose from 'mongoose';

export async function connectDatabase(uri) {
  const connection = await mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 5000,
    maxPoolSize: 10,
    bufferCommands: false,
  }).asPromise();
  try {
    const topology = await connection.db.admin().command({ hello: 1 });
    if (!topology.setName && topology.msg !== 'isdbgrid') {
      throw new Error('MongoDB must support transactions (replica set or sharded cluster).');
    }
    return connection;
  } catch (error) {
    await connection.close();
    throw error;
  }
}

export async function checkDatabase(connection) {
  if (connection.readyState !== 1) throw new Error('Database unavailable');
  await connection.db.admin().command({ ping: 1, maxTimeMS: 2000 });
}
