// Script to check database structure
const db = require("./config/db");

console.log("\n📊 Checking Database Structure...\n");

db.init()
  .then(() => {
    const database = db.getDb();

    // Get all tables
    database.all(
      `
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name
        `,
      [],
      (err, tables) => {
        if (err) {
          console.error("Error:", err);
          process.exit(1);
        }

        console.log(`✅ Found ${tables.length} tables:\n`);

        tables.forEach((table, index) => {
          console.log(`${index + 1}. ${table.name}`);

          // Get column info for each table
          database.all(
            `PRAGMA table_info(${table.name})`,
            [],
            (err, columns) => {
              if (!err) {
                console.log("   Columns:");
                columns.forEach((col) => {
                  console.log(
                    `   - ${col.name} (${col.type})${col.pk ? " PRIMARY KEY" : ""}`,
                  );
                });
                console.log("");
              }

              // Close after last table
              if (index === tables.length - 1) {
                setTimeout(() => {
                  db.close().then(() => process.exit(0));
                }, 100);
              }
            },
          );
        });
      },
    );
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
