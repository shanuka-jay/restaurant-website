const { dbRun } = require('../config/database');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        // ------------------- CATEGORIES -------------------
        const categories = [
            { name: 'Pasta', description: 'Delicious pasta dishes' },
            { name: 'Pizza', description: 'Wood-fired Italian pizzas' },
            { name: 'Main Course', description: 'Hearty main meals' },
            { name: 'Dessert', description: 'Sweet Italian desserts' }
        ];

        for (const cat of categories) {
            await dbRun(
                `INSERT INTO categories (name, description) 
                 VALUES (?, ?)
                 ON CONFLICT(name) DO UPDATE SET description=excluded.description`,
                [cat.name, cat.description]
            );
        }

        console.log('✅ Categories seeded');

        // ------------------- MENU ITEMS -------------------
        const menuItems = [
            {
                id: 'carbonara',
                name: 'Spaghetti Carbonara',
                category: 'Pasta',
                price: 22,
                description: 'Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper',
                image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
                ingredients: JSON.stringify([
                    'Spaghetti pasta', 'Guanciale', 'Fresh eggs', 'Pecorino Romano cheese', 'Black pepper', 'Sea salt'
                ]),
                isAvailable: 1
            },
            {
                id: 'lasagna',
                name: 'Lasagna Bolognese',
                category: 'Pasta',
                price: 24,
                description: 'Layers of pasta, rich meat sauce, béchamel, and parmesan cheese',
                image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
                ingredients: JSON.stringify([
                    'Fresh pasta sheets','Ground beef and pork','San Marzano tomatoes','Béchamel sauce',
                    'Parmigiano-Reggiano','Onions, carrots, celery','Red wine','Fresh herbs'
                ]),
                isAvailable: 1
            },
            {
                id: 'margherita',
                name: 'Margherita Pizza',
                category: 'Pizza',
                price: 18,
                description: 'Fresh mozzarella, San Marzano tomatoes, basil, and extra virgin olive oil',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
                ingredients: JSON.stringify([
                    'Hand-stretched pizza dough','San Marzano tomatoes','Fresh mozzarella di bufala',
                    'Fresh basil','Extra virgin olive oil','Sea salt'
                ]),
                isAvailable: 1
            },
            {
                id: 'quattro',
                name: 'Quattro Formaggi Pizza',
                category: 'Pizza',
                price: 20,
                description: 'Four-cheese pizza with mozzarella, gorgonzola, fontina, and Parmigiano-Reggiano',
                image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
                ingredients: JSON.stringify([
                    'Pizza dough','Mozzarella','Gorgonzola','Fontina','Parmigiano-Reggiano','Olive oil','Fresh herbs'
                ]),
                isAvailable: 1
            },
            {
                id: 'risotto',
                name: 'Mushroom Risotto',
                category: 'Main Course',
                price: 24,
                description: 'Creamy risotto with porcini mushrooms, wine, and truffle oil',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
                ingredients: JSON.stringify([
                    'Arborio rice','Porcini mushrooms','Mixed mushrooms','White wine','Vegetable stock',
                    'Parmigiano-Reggiano','Butter','White truffle oil','Shallots','Parsley'
                ]),
                isAvailable: 1
            },
            {
                id: 'ossobuco',
                name: 'Osso Buco',
                category: 'Main Course',
                price: 32,
                description: 'Slow-cooked veal shanks with vegetables and gremolata',
                image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
                ingredients: JSON.stringify([
                    'Veal shanks','White wine','Tomatoes','Carrots, celery, onions','Beef stock','Lemon zest','Fresh parsley','Garlic','Olive oil'
                ]),
                isAvailable: 1
            },
            {
                id: 'tiramisu',
                name: 'Tiramisu',
                category: 'Dessert',
                price: 12,
                description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
                ingredients: JSON.stringify([
                    'Ladyfinger cookies','Mascarpone cheese','Espresso','Eggs','Sugar','Cocoa powder','Marsala wine'
                ]),
                isAvailable: 1
            },
            {
                id: 'pannacotta',
                name: 'Panna Cotta',
                category: 'Dessert',
                price: 10,
                description: 'Silky-smooth vanilla cream dessert with berry compote',
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
                ingredients: JSON.stringify([
                    'Heavy cream','Vanilla bean','Sugar','Gelatin','Fresh mixed berries','Mint leaves'
                ]),
                isAvailable: 1
            }
        ];

        for (const item of menuItems) {
            await dbRun(
                `INSERT INTO menu_items (id, name, category, price, description, image, ingredients, isAvailable)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                     name=excluded.name,
                     category=excluded.category,
                     price=excluded.price,
                     description=excluded.description,
                     image=excluded.image,
                     ingredients=excluded.ingredients,
                     isAvailable=excluded.isAvailable`,
                [
                    item.id,
                    item.name,
                    item.category,
                    item.price,
                    item.description,
                    item.image,
                    item.ingredients,
                    item.isAvailable
                ]
            );
        }

        console.log('✅ Menu items seeded');
        console.log('🎉 Database seeding completed successfully!');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();