/** @format */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const chalk = require('chalk');

class dbmanager {
	static async createSchema(db) {
		await db.exec('PRAGMA journal_mode = WAL;');
		await db.exec('PRAGMA synchronous = NORMAL;');

		await db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT,
                remoteJid TEXT,
message TEXT,
                timestamp INTEGER,
        pushName TEXT,
                participant TEXT,
                messageType TEXT,
                PRIMARY KEY (id, remoteJid)
            )
        `);

		await db.exec(`
            CREATE TABLE IF NOT EXISTS push_names (
                jid TEXT PRIMARY KEY,
    push_name TEXT,
                last_updated INTEGER
            )
        `);

		await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_remoteJid 
            ON messages (remoteJid)
        `);
		await db.exec(`
        CREATE INDEX IF NOT EXISTS idx_remoteJid_timestamp 
            ON messages (remoteJid, timestamp DESC)
        `);
	}
	static async optimizeDatabase(db) {
		await db.exec(`
            PRAGMA optimize;
    PRAGMA wal_checkpoint(TRUNCATE);
        `);
	}
}

class sql_store {
	constructor(logger) {
		this.logger = logger;
		this.db = null;
		this.queueProcessor = null;
	}

	async initialize() {
		try {
			this.db = await open({
				filename: path.join(__dirname, '..', 'database.db'),
				driver: sqlite3.Database,
			});

			await dbmanager.createSchema(this.db);
			this.queueProcessor = new MessageQueueProcessor(this.db);

			console.log(chalk.green('SQLite store initialized successfully'));
		} catch (error) {
			console.error(chalk.red('Error initializing SQLite store:', error));
			throw error;
		}
	}

	async writeMessage(message) {
		this.queueProcessor.addToQueue(message);
		if (message.pushName) {
			const jid = this._cleanJid(
				message.key.participant || message.key.remoteJid
			);
			if (jid !== 'status@broadcast') {
				this.queueProcessor.addPushNameToQueue(jid, message.pushName);
			}
		}
	}

	_cleanJid(jid) {
		return jid.includes('@') ? jid.split('@')[0] + '@s.whatsapp.net' : jid;
	}

	async getPushName(jid) {
		try {
			if (!jid) return 'User';
			const cleanJid = this._cleanJid(jid);

			const pushNameResult = await this.db.get(
				`
                SELECT push_name FROM push_names
                WHERE jid = ?
`,
				[cleanJid]
			);

			if (pushNameResult?.push_name) {
				return pushNameResult.push_name;
			}

			const messageResult = await this.db.get(
				`
SELECT pushName FROM messages
                WHERE (remoteJid = ? OR participant = ?)
            AND pushName IS NOT NULL
                AND pushName != ''
                ORDER BY timestamp DESC
                LIMIT 1
    `,
				[cleanJid, cleanJid]
			);

			return messageResult?.pushName || cleanJid.split('@')[0] || 'User';
		} catch (error) {
			console.error(`Error getting pushName: ${error}`);
			return 'User';
		}
	}

	async checkMessageStats() {
		try {
			const sampleMessages = await this.db.all(`
            SELECT 
                id,
    timestamp,
            TYPEOF(timestamp) as timestamp_type
        FROM messages 
            LIMIT 5
        `);

			console.log('Sample message timestamps:', sampleMessages);

			const stats = await this.db.get(`
        SELECT 
                COUNT(*) as total_count,
    TYPEOF(MIN(timestamp)) as min_timestamp_type,
            TYPEOF(MAX(timestamp)) as max_timestamp_type
        FROM messages
        `);

			return {
				messageCount: stats.total_count,
				timestampTypes: {
					min: stats.min_timestamp_type,
					max: stats.max_timestamp_type,
				},
				samples: sampleMessages,
			};
		} catch (error) {
			console.error('Error checking message stats:', error);
			throw error;
		}
	}

	async loadMessage(jid, messageId) {
		try {
			const result = await this.db.get(
				'SELECT message FROM messages WHERE remoteJid = ? AND id = ?',
				[jid, messageId]
			);
			return result ? JSON.parse(result.message) : undefined;
		} catch (error) {
			console.error(chalk.red('Error loading message:', error));
			return undefined;
		}
	}

	async findMessageById(messageId) {
		try {
			const result = await this.db.get(
				'SELECT message FROM messages WHERE id = ?',
				[messageId]
			);
			return result ? JSON.parse(result.message) : undefined;
		} catch (error) {
			console.error(chalk.red('Error finding message by ID:', error));
			return undefined;
		}
	}

	async getChatHistory(jid, limit = 50) {
		try {
			return await this.db.all(
				'SELECT message FROM messages WHERE remoteJid = ? ORDER BY timestamp DESC LIMIT ?',
				[jid, limit]
			);
		} catch (error) {
			console.error(chalk.red('Error getting chat history:', error));
			return [];
		}
	}

	async clearOldMessages(daysToKeep = 1, options = {}) {
		const {
			batchSize = 1000,
			maxAttempts = 3,
			vacuumThreshold = 5000,
			timeout = 30000,
		} = options;

		let attempt = 0;
		let totalDeleted = 0;
		const startTime = Date.now();

		while (attempt < maxAttempts) {
			try {
				await this.db.run(`PRAGMA busy_timeout = ${timeout};`);

				const cutoffTime =
					Math.floor(Date.now() / 1000) - daysToKeep * 24 * 60 * 60;

				let deleted;
				do {
					const result = await this.db.run(
						`
                      WITH messages_to_delete AS (
SELECT id
                            FROM messages 
                          WHERE timestamp < ?
                            LIMIT ?
                        )
       DELETE FROM messages 
         WHERE id IN (SELECT id FROM messages_to_delete)
                  `,
						[cutoffTime, batchSize]
					);

					deleted = result.changes;
					totalDeleted += deleted;

					if (deleted > 0) {
						console.log(
							chalk.blue(
								`Batch deleted ${deleted} messages. Total: ${totalDeleted}`
							)
						);
					}

					if (Date.now() - startTime > timeout) {
						console.log(
							chalk.yellow(
								'Operation timeout reached. Will resume in next run.'
							)
						);
						break;
					}

					await new Promise(resolve => setTimeout(resolve, 100));
				} while (deleted === batchSize);

				if (totalDeleted >= vacuumThreshold) {
					try {
						console.log(chalk.blue('Running database optimization...'));

						await this.db.run('COMMIT');

						await dbmanager.optimizeDatabase(this.db);

						try {
							await this.db.run('VACUUM;');
							console.log(
								chalk.green('Database vacuum completed successfully')
							);
						} catch (vacuumError) {
							console.warn(
								chalk.yellow('VACUUM operation failed:', vacuumError)
							);
						}
					} catch (optimizeError) {
						console.warn(
							chalk.yellow('Database optimization failed:', optimizeError)
						);
					}
				}

				console.log(
					chalk.green(`Successfully cleared ${totalDeleted} old messages`)
				);
				return {
					success: true,
					messagesDeleted: totalDeleted,
					attempts: attempt + 1,
				};
			} catch (error) {
				attempt++;
				console.error(chalk.red(`Cleanup attempt ${attempt} failed:`, error));

				if (attempt >= maxAttempts) {
					throw new Error(
						`Failed to clear messages after ${maxAttempts} attempts: ${error.message}`
					);
				}

				await new Promise(resolve =>
					setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000))
				);
			}
		}
	}

	async checkDatabaseHealth() {
		try {
			await this.db.get('SELECT 1');

			const integrityCheck = await this.db.get('PRAGMA integrity_check;');
			if (integrityCheck.integrity_check !== 'ok') {
				throw new Error('Database integrity check failed');
			}

			const pageCount = await this.db.get('PRAGMA page_count;');
			const pageSize = await this.db.get('PRAGMA page_size;');
			const dbSize =
				(pageCount['page_count'] * pageSize['page_size']) / (1024 * 1024);

			return {
				status: 'healthy',
				sizeInMB: dbSize.toFixed(2),
				lastChecked: new Date().toISOString(),
			};
		} catch (error) {
			console.error(chalk.red('Database health check failed:', error));
			throw error;
		}
	}

	async bind(ev) {
		ev.on('messages.upsert', async ({ messages }) => {
			for (const message of messages) {
				await this.writeMessage(message);
			}
		});
	}

	async close() {
		try {
			if (this.db) {
				await this.db.close();
				console.log(chalk.green('Database connection closed successfully'));
			}
		} catch (error) {
			console.error(chalk.red('Error closing database connection:', error));
		}
	}
}

class MessageQueueProcessor {
	constructor(db) {
		this.db = db;
		this.writeQueue = [];
		this.pushNameQueue = [];
		this.isProcessingQueue = false;
	}

	async processQueue() {
		if (
			this.isProcessingQueue ||
			(this.writeQueue.length === 0 && this.pushNameQueue.length === 0)
		)
			return;

		this.isProcessingQueue = true;
		try {
			await this.db.run('BEGIN TRANSACTION');

			const messageStmt = await this.db.prepare(`
INSERT OR REPLACE INTO messages 
     (id, remoteJid, message, timestamp, pushName, participant, messageType) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

			const pushNameStmt = await this.db.prepare(`
                INSERT OR REPLACE INTO push_names 
  (jid, push_name, last_updated) 
                VALUES (?, ?, ?)
       `);

			while (this.writeQueue.length > 0) {
				const message = this.writeQueue.shift();
				const { key, messageTimestamp, pushName, participant, type } = message;

				await messageStmt.run(
					key.id,
					key.remoteJid,
					JSON.stringify(message),
					messageTimestamp,
					pushName,
					participant,
					type
				);
			}

			while (this.pushNameQueue.length > 0) {
				const { jid, pushName } = this.pushNameQueue.shift();

				await pushNameStmt.run(jid, pushName, Math.floor(Date.now() / 1000));
			}

			await messageStmt.finalize();
			await pushNameStmt.finalize();
			await this.db.run('COMMIT');
		} catch (error) {
			console.error(chalk.red('Error processing write queue:', error));
			await this.db.run('ROLLBACK');
			if (this.writeQueue.length === 0)
				this.writeQueue.unshift(...this.writeQueue);
			if (this.pushNameQueue.length === 0)
				this.pushNameQueue.unshift(...this.pushNameQueue);
		} finally {
			this.isProcessingQueue = false;
			setTimeout(() => this.processQueue(), 100);
		}
	}

	addToQueue(message) {
		this.writeQueue.push(message);
		if (!this.isProcessingQueue) {
			this.processQueue();
		}
	}

	addPushNameToQueue(jid, pushName) {
		this.pushNameQueue.push({ jid, pushName });
		if (!this.isProcessingQueue) {
			this.processQueue();
		}
	}
}

module.exports = sql_store;
module.exports.dbmanager = dbmanager;
