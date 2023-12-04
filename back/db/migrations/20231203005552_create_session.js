exports.up = function (knex) {
	return knex.schema.createTable('session', function (table) {
		table.string('sid').primary();
		table.json('sess').notNullable();
		table.timestamp('expire').notNullable().index();
	});
};

exports.down = function (knex) {
	return knex.schema.dropTable('session');
};
