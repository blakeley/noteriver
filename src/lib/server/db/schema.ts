import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	doublePrecision,
	primaryKey
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const midis = pgTable('midis', {
	id: serial('id').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	createdById: text('created_by_id').references(() => users.id),
	s3key: text('s3key').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	duration: doublePrecision('duration').notNull(),
	instruments: integer('instruments').array()
});

export const favorites = pgTable(
	'favorites',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id),
		midiId: integer('midi_id')
			.notNull()
			.references(() => midis.id)
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.userId, table.midiId] })
		};
	}
);

export const comments = pgTable('comments', {
	id: serial('id').primaryKey(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	midiId: integer('midi_id')
		.notNull()
		.references(() => midis.id),
	text: text('text').notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	midis: many(midis),
	favorites: many(favorites),
	comments: many(comments)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const midisRelations = relations(midis, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [midis.createdById],
		references: [users.id]
	}),
	favorites: many(favorites),
	comments: many(comments)
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id]
	}),
	midi: one(midis, {
		fields: [favorites.midiId],
		references: [midis.id]
	})
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	midi: one(midis, {
		fields: [comments.midiId],
		references: [midis.id]
	})
}));

// Type exports
export type Session = typeof sessions.$inferSelect;
export type User = typeof users.$inferSelect;
export type Midi = typeof midis.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type Comment = typeof comments.$inferSelect;
