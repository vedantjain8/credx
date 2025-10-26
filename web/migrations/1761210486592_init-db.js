/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */

export const up = (pgm) => {
  // settings
  pgm.createExtension("vector", { ifNotExists: true, schema: "public" });
  pgm.createExtension("pg_cron", { ifNotExists: true, schema: "pg_catalog" });

  // Create ENUM types
  pgm.createType("event_type", ["click", "view"], { ifNotExists: true });
  pgm.createType("moderation_action", ["approved", "rejected", "blocked"], {
    ifNotExists: true,
  });
  pgm.createType("promotion_status", ["active", "inactive", "pending"], {
    ifNotExists: true,
  });
  pgm.createType(
    "transaction_type",
    [
      "promotion_fee",
      "platform_fee",
      "deposit",
      "withdrawal",
      "viewer_bonus",
      "host_payment",
    ],
    { ifNotExists: true }
  );
  pgm.createType("user_role", ["promoter", "host", "viewer", "admin"], {
    ifNotExists: true,
  });
  pgm.createType("website_status", ["active", "inactive", "blocked"], {
    ifNotExists: true,
  });

  // Create functions
  pgm.createFunction(
    "update_updated_at",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
      security: "definer",
    },
    `
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    `
  );

  // Create tables
  pgm.createTable("users", {
    user_id: { type: "uuid", primaryKey: true },
    role: { type: "user_role", notNull: true, default: "viewer" },
    updated_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
      notNull: true,
    },
  });

  pgm.createTable("websites", {
    website_id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    owner_id: {
      type: "uuid",
      notNull: true,
      references: "public.users(user_id)",
      onDelete: "CASCADE",
    },
    domain_name: { type: "varchar(255)", notNull: true, unique: true },
    rss_feed_url: { type: "varchar(2048)" },
    status: {
      type: "website_status",
      notNull: true,
      default: "inactive",
    },
    verification_token: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      unique: true,
    },
    verification_token_expires_at: { type: "timestamp with time zone" },
    verified_at: { type: "timestamp with time zone" },
    created_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
  });

  pgm.createTable("promotions", {
    promotion_id: { type: "serial", notNull: true, primaryKey: true },
    title: { type: "text", notNull: true },
    image_url: { type: "text", notNull: true },
    summary: { type: "text", notNull: true },
    tags: { type: "text[]", notNull: true },
    categories: { type: "text", notNull: true },
    article_url: { type: "text", notNull: true },
    budget: { type: "numeric", notNull: true },
    remaining_impressions: { type: "integer", default: 0 },
    boost: { type: "numeric", default: 1.0 },
    embedding: { type: "vector(768)", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
    updated_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
    promoter_id: {
      type: "uuid",
      notNull: true,
      references: "public.users(user_id)",
      onDelete: "CASCADE",
    },
    s3_path: { type: "varchar(255)" },
    status: { type: "promotion_status", notNull: true, default: "pending" },
    website_id: {
      type: "uuid",
      notNull: true,
      references: "public.websites(website_id)",
      onDelete: "CASCADE",
    },
  });

  pgm.createTable("events", {
    event_id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    promoted_content_id: {
      type: "serial",
      references: "public.promotions(promotion_id)",
      onDelete: "SET NULL",
    },
    host_website_id: {
      type: "uuid",
      references: "public.websites(website_id)",
      onDelete: "SET NULL",
    },
    viewer_user_id: {
      type: "uuid",
      references: "public.users(user_id)",
      onDelete: "SET NULL",
    },
    event_type: { type: "event_type", notNull: true },
    ip_address: { type: "inet" },
    user_agent: { type: "text" },
    created_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
  });

  pgm.createTable("moderation_logs", {
    log_id: { type: "bigserial", notNull: true, primaryKey: true },
    content_id: {
      type: "serial",
      references: "public.promotions(promotion_id)",
      onDelete: "CASCADE",
    },
    admin_user_id: {
      type: "uuid",
      references: "public.users(user_id)",
      onDelete: "SET NULL",
    },
    action: { type: "moderation_action", notNull: true },
    reason: { type: "text" },
    created_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
  });

  pgm.createTable("wallets", {
    wallet_id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "public.users(user_id)",
      onDelete: "CASCADE",
    },
    balance: {
      type: "numeric(10,2)",
      notNull: true,
      default: 0.0,
      check: "balance >= 0",
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });

  pgm.createTable("transactions", {
    transaction_id: { type: "bigserial", notNull: true, primaryKey: true },
    content_id: {
      type: "serial",
      references: "public.promotions(promotion_id)",
      onDelete: "SET NULL",
    },
    from_wallet_id: {
      type: "uuid",
      references: "public.wallets(wallet_id)",
      onDelete: "SET NULL",
    },
    to_wallet_id: {
      type: "uuid",
      references: "public.wallets(wallet_id)",
      onDelete: "SET NULL",
    },
    amount: { type: "numeric(10,2)", notNull: true, check: "amount > 0" },
    transaction_type: { type: "transaction_type", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
  });

  pgm.createTable("user_preferences", {
    preference_id: { type: "bigserial", notNull: true, primaryKey: true },
    user_id: {
      type: "uuid",
      unique: true,
      references: "public.users(user_id)",
      onDelete: "CASCADE",
    },
    interests: { type: "text[]", notNull: true },
    updated_at: {
      type: "timestamp with time zone",
      default: pgm.func("NOW()"),
    },
  });

  // Create indexes
  pgm.createIndex("events", "host_website_id");
  pgm.createIndex("events", "ip_address");
  pgm.createIndex("events", "promoted_content_id");
  pgm.createIndex("events", "viewer_user_id");
  pgm.createIndex("moderation_logs", "content_id");
  pgm.createIndex("transactions", "content_id");
  pgm.createIndex("transactions", "from_wallet_id");
  pgm.createIndex("transactions", "to_wallet_id");
  pgm.createIndex("user_preferences", "user_id");
  pgm.createIndex("wallets", "user_id");
  pgm.createIndex("websites", "owner_id");
  pgm.createIndex("websites", "status");
  pgm.sql(`
    CREATE INDEX IF NOT EXISTS promotions_embedding_index 
    ON promotions 
    USING hnsw (embedding vector_cosine_ops);
  `);

  // Create triggers
  pgm.createTrigger("wallets", "wallets_update_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at",
    level: "ROW",
  });

  pgm.createTrigger("promotions", "promotions_update_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at",
    level: "ROW",
  });

  pgm.createTrigger("transactions", "transactions_update_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at",
    level: "ROW",
  });

  pgm.createTrigger("websites", "websites_update_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at",
    level: "ROW",
  });

  pgm.createTrigger("users", "users_update_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at",
    level: "ROW",
  });

  // some automations triggers
  pgm.createFunction(
    "auto_inactivate_promotions",
    [],
    {
      returns: "trigger",
      language: "plpgsql",
      security: "definer",
    },
    `
  BEGIN
    IF NEW.remaining_impressions <= 0 AND NEW.status != 'inactive' THEN
      NEW.status := 'inactive';
    END IF;
    RETURN NEW;
  END;
  `
  );
  pgm.createTrigger("promotions", "auto_inactivate_trigger", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "auto_inactivate_promotions",
    level: "ROW",
  });

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM cron.job
        WHERE jobname = 'delete_old_inactive_promotions'
      ) THEN
        PERFORM cron.schedule(
          'delete_old_inactive_promotions',
          '0 3 * * *',  -- runs daily at 3 AM server time
          $_$
            DELETE FROM public.promotions
            WHERE status = 'inactive'
            AND updated_at < NOW() - INTERVAL '30 days';
          $_$
        );
      END IF;
    END;
    $$;
  `);

  pgm.sql(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      -- 1. Create a corresponding user profile in the public.users table.
      INSERT INTO public.users (user_id, role)
      VALUES (new.id, 'viewer');

      -- 2. Create a wallet for the new user with a starting balance of 0.
      INSERT INTO public.wallets (user_id, balance)
      VALUES (new.id, 0.0);

      -- 3. Create default user preferences.
      INSERT INTO public.user_preferences (user_id, interests)
      VALUES (new.id, ARRAY[]::text[]);

      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

  pgm.sql(`
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
`);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // Drop triggers
  pgm.dropTrigger("wallets", "wallets_update_trigger", { ifExists: true });
  pgm.dropTrigger("promotions", "promotions_update_trigger", {
    ifExists: true,
  });
  pgm.dropTrigger("transactions", "transactions_update_trigger", {
    ifExists: true,
  });
  pgm.dropTrigger("websites", "websites_update_trigger", { ifExists: true });
  pgm.dropTrigger("users", "users_update_trigger", { ifExists: true });

  // Drop automation triggers
  pgm.sql(`SELECT cron.unschedule('delete_old_inactive_promotions');`);
  pgm.dropTrigger("promotions", "auto_inactivate_trigger", { ifExists: true });
  pgm.dropFunction("auto_inactivate_promotions", [], { ifExists: true });

  // Drop functions
  pgm.dropFunction("update_updated_at", [], { ifExists: true });

  // Drop tables in reverse order
  pgm.dropTable("user_preferences", { ifExists: true });
  pgm.dropTable("transactions", { ifExists: true });
  pgm.dropTable("moderation_logs", { ifExists: true });
  pgm.dropTable("events", { ifExists: true });
  pgm.dropTable("wallets", { ifExists: true });
  pgm.dropTable("promotions", { ifExists: true });
  pgm.dropTable("websites", { ifExists: true });
  pgm.dropTable("users", { ifExists: true });

  // Drop indexes
  pgm.dropIndex("events", "host_website_id", { ifExists: true });
  pgm.dropIndex("events", "ip_address", { ifExists: true });
  pgm.dropIndex("events", "promoted_content_id", { ifExists: true });
  pgm.dropIndex("events", "viewer_user_id", { ifExists: true });
  pgm.dropIndex("moderation_logs", "content_id", { ifExists: true });
  pgm.dropIndex("transactions", "content_id", { ifExists: true });
  pgm.dropIndex("transactions", "from_wallet_id", { ifExists: true });
  pgm.dropIndex("transactions", "to_wallet_id", { ifExists: true });
  pgm.dropIndex("user_preferences", "user_id", { ifExists: true });
  pgm.dropIndex("wallets", "user_id", { ifExists: true });
  pgm.dropIndex("websites", "owner_id", { ifExists: true });
  pgm.dropIndex("websites", "status", { ifExists: true });
  pgm.dropIndex("promotions", "embedding", {
    name: "promotions_embedding_index",
    ifExists: true,
  });

  // Drop ENUM types
  pgm.dropType("event_type", { ifExists: true });
  pgm.dropType("moderation_action", { ifExists: true });
  pgm.dropType("promotion_status", { ifExists: true });
  pgm.dropType("transaction_type", { ifExists: true });
  pgm.dropType("user_role", { ifExists: true });
  pgm.dropType("website_status", { ifExists: true });

  // Drop extensions
  pgm.dropExtension("vector", { ifExists: true, cascade: true });
  pgm.dropExtension("pg_cron", { ifExists: true, cascade: true });
  pgm.sql("REVOKE USAGE ON SCHEMA auth FROM postgres;");
  pgm.sql("REVOKE SELECT, INSERT, UPDATE, DELETE ON auth.users FROM postgres;");
};
