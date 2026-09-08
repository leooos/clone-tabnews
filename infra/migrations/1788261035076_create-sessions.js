exports.up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    token: {
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    userId: {
      type: "uuid",
      notNull: true,
    },

    expiresAt: {
      type: "timestamptz",
      notNull: true,
    },

    createdAt: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },

    updatedAt: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
  });
};

exports.down = false;
