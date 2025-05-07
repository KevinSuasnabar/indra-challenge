import { Pool } from "pg";

export interface Appointment {
  insuredId: string;
  scheduleId: number;
}

export class PostgresService {
  private pool: Pool;
  private tableName = "appointments";

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }

  async insert(appointment: Appointment): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO ${this.tableName} 
        (insured_id, schedule_id)
        VALUES ($1, $2)
      `;

      await client.query(query, [
        appointment.insuredId,
        appointment.scheduleId,
      ]);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
