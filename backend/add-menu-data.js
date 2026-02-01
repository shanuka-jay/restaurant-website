// Script to add sample menu items to database
const db = require("./config/db");

const menuItems = [
  // PASTA
  {
    name: "Spaghetti Carbonara",
    category: "pasta",
    price: 22.0,
    description:
      "A classic Roman pasta dish with crispy guanciale, farm-fresh eggs, aged Pecorino Romano cheese, and freshly cracked black pepper.",
    image_url:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    ingredients: "Spaghetti,Guanciale,Eggs,Pecorino Romano,Black Pepper",
  },
  {
    name: "Lasagna Bolognese",
    category: "pasta",
    price: 24.0,
    description:
      "Layers of tender pasta sheets, slow-cooked Bolognese sauce, creamy béchamel, and Parmigiano-Reggiano cheese.",
    image_url:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
    ingredients: "Pasta Sheets,Ground Beef,Tomatoes,Béchamel,Parmigiano",
  },
  {
    name: "Fettuccine Alfredo",
    category: "pasta",
    price: 20.0,
    description:
      "Creamy fettuccine pasta with butter, heavy cream, and freshly grated Parmesan cheese.",
    image_url:
      "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800",
    ingredients: "Fettuccine,Butter,Cream,Parmesan Cheese",
  },

  // PIZZA
  {
    name: "Margherita Pizza",
    category: "pizza",
    price: 18.0,
    description:
      "The queen of pizzas! Hand-stretched dough with San Marzano tomatoes, fresh mozzarella di bufala, and basil.",
    image_url:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    ingredients: "Pizza Dough,San Marzano Tomatoes,Mozzarella,Basil,Olive Oil",
  },
  {
    name: "Quattro Formaggi",
    category: "pizza",
    price: 20.0,
    description:
      "A cheese lover's dream with mozzarella, gorgonzola, fontina, and Parmigiano-Reggiano.",
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    ingredients: "Pizza Dough,Mozzarella,Gorgonzola,Fontina,Parmigiano",
  },
  {
    name: "Pepperoni Pizza",
    category: "pizza",
    price: 19.0,
    description:
      "Classic pizza topped with tomato sauce, mozzarella, and spicy pepperoni slices.",
    image_url:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
    ingredients: "Pizza Dough,Tomato Sauce,Mozzarella,Pepperoni",
  },

  // MAINS
  {
    name: "Mushroom Risotto",
    category: "mains",
    price: 24.0,
    description:
      "Creamy Arborio rice with porcini mushrooms, white wine, and truffle oil.",
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800",
    ingredients:
      "Arborio Rice,Porcini Mushrooms,White Wine,Truffle Oil,Parmesan",
  },
  {
    name: "Osso Buco",
    category: "mains",
    price: 32.0,
    description:
      "Tender veal shanks braised for hours with white wine, aromatics, and topped with gremolata.",
    image_url:
      "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800",
    ingredients: "Veal Shanks,White Wine,Tomatoes,Carrots,Celery,Gremolata",
  },
  {
    name: "Chicken Parmigiana",
    category: "mains",
    price: 26.0,
    description:
      "Breaded chicken breast topped with marinara sauce and melted mozzarella cheese.",
    image_url:
      "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800",
    ingredients:
      "Chicken Breast,Breadcrumbs,Marinara Sauce,Mozzarella,Parmesan",
  },

  // DESSERTS
  {
    name: "Tiramisu",
    category: "desserts",
    price: 12.0,
    description:
      "Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, and cocoa powder.",
    image_url:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800",
    ingredients: "Ladyfingers,Espresso,Mascarpone,Eggs,Cocoa Powder",
  },
  {
    name: "Panna Cotta",
    category: "desserts",
    price: 10.0,
    description: "Silky Italian cream dessert served with fresh berry compote.",
    image_url:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
    ingredients: "Cream,Sugar,Vanilla,Gelatin,Mixed Berries",
  },
  {
    name: "Cannoli",
    category: "desserts",
    price: 11.0,
    description:
      "Crispy pastry shells filled with sweet ricotta cream and chocolate chips.",
    image_url:
      "https://images.unsplash.com/photo-1534997929305-ce2c055d64c7?w=800",
    ingredients:
      "Pastry Shells,Ricotta Cheese,Sugar,Chocolate Chips,Pistachios",
  },
];

console.log("\n🍝 Adding sample menu items...\n");

db.init()
  .then(() => {
    const database = db.getDb();

    // First, check if menu items already exist
    database.get(
      "SELECT COUNT(*) as count FROM menu_items",
      [],
      (err, result) => {
        if (err) {
          console.error("Error checking menu items:", err);
          process.exit(1);
        }

        if (result.count > 0) {
          console.log(`⚠️  Database already has ${result.count} menu items.`);
          console.log(
            "Do you want to add more? (This will create duplicates)\n",
          );
          process.exit(0);
        }

        // Insert menu items
        const stmt = database.prepare(
          "INSERT INTO menu_items (name, category, price, description, image_url, ingredients) VALUES (?, ?, ?, ?, ?, ?)",
        );

        let inserted = 0;
        menuItems.forEach((item, index) => {
          stmt.run(
            item.name,
            item.category,
            item.price,
            item.description,
            item.image_url,
            item.ingredients,
            (err) => {
              if (err) {
                console.error(`❌ Error adding ${item.name}:`, err);
              } else {
                inserted++;
                console.log(`✅ Added: ${item.name} ($${item.price})`);
              }

              // Close after last item
              if (index === menuItems.length - 1) {
                stmt.finalize();
                setTimeout(() => {
                  console.log(
                    `\n🎉 Successfully added ${inserted} menu items!`,
                  );
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
