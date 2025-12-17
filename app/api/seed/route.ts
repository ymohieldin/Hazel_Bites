import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import Table from "@/lib/models/Table";
import Restaurant from "@/lib/models/Restaurant";

export async function GET() {
    await connectToDatabase();

    try {
        // Clear existing data (optional, but good for clean slate)
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Table.deleteMany({});
        await Restaurant.deleteMany({});

        // 1. Create Restaurant
        const restaurant = await Restaurant.create({
            name: "Hazel Bites",
            address: "123 Nile View, Cairo",
        });

        // 2. Create Tables (1-15)
        const tables = [];
        for (let i = 1; i <= 15; i++) {
            tables.push({
                number: i,
                restaurantId: restaurant._id,
                status: "free"
            });
        }
        await Table.insertMany(tables);

        // 3. Create Categories
        const categories = await Category.insertMany([
            { name: "Popular", restaurantId: restaurant._id }, // Using typical categorization
            { name: "Burgers", restaurantId: restaurant._id },
            { name: "Egyptian Classics", restaurantId: restaurant._id },
            { name: "Pizza", restaurantId: restaurant._id },
            { name: "Desserts", restaurantId: restaurant._id },
            { name: "Drinks", restaurantId: restaurant._id }
        ]);

        const catMap = categories.reduce((acc: any, cat) => {
            acc[cat.name] = cat._id;
            return acc;
        }, {});

        // 4. Create Products (Original + 10 New)
        const products = [
            // Original
            {
                name: "Classic Cheeseburger",
                description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and house sauce.",
                price: 150, // EGP (~$3 -> ~150)
                categoryId: catMap["Burgers"],
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                options: [
                    { name: "Extra Cheese", price: 20 },
                    { name: "Bacon", price: 30 },
                    { name: "No Onions", price: 0 }
                ]
            },
            {
                name: "Crispy Fries",
                description: "Golden shoestring fries with sea salt.",
                price: 50,
                categoryId: catMap["Popular"], // Also side
                image: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Chocolate Shake",
                description: "Rich chocolate ice cream blended with milk.",
                price: 75,
                categoryId: catMap["Drinks"],
                image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },

            // New Items
            {
                name: "Koshary",
                description: "Egypt's national dish: Rice, lentils, pasta, chickpeas, and spicy tomato sauce.",
                price: 60,
                categoryId: catMap["Egyptian Classics"],
                image: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=500&q=60",
                isAvailable: true,
                options: [{ name: "Extra Sauce", price: 5 }, { name: "Spicy", price: 0 }]
            },
            {
                name: "Hawawshi",
                description: "Crispy pita bread stuffed with spiced minced meat.",
                price: 85,
                categoryId: catMap["Egyptian Classics"],
                image: "https://images.unsplash.com/photo-1628156158223-1d4cf2dc578f?auto=format&fit=crop&w=500&q=60", // Generic meat pie
                isAvailable: true,
                options: [{ name: "Tahini Dip", price: 10 }]
            },
            {
                name: "Mix Grill",
                description: "Selection of kofta, shish tawook, and grilled kebab.",
                price: 350,
                categoryId: catMap["Egyptian Classics"],
                image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Margherita Pizza",
                description: "Tomato sauce, fresh mozzarella, and basil.",
                price: 180,
                categoryId: catMap["Pizza"],
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Pepperoni Pizza",
                description: "Spicy pepperoni slices and melted cheese.",
                price: 210,
                categoryId: catMap["Pizza"],
                image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "BBQ Chicken Pizza",
                description: "Grilled chicken, BBQ sauce, red onions, and cilantro.",
                price: 230,
                categoryId: catMap["Pizza"],
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Molten Cake",
                description: "Warm chocolate cake with a gooey center.",
                price: 95,
                categoryId: catMap["Desserts"],
                image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Om Ali",
                description: "Traditional bread pudding with nuts, milk, and cream.",
                price: 70,
                categoryId: catMap["Desserts"],
                image: "https://images.unsplash.com/photo-1582390315259-22cb15467566?auto=format&fit=crop&w=500&q=60", // Generic pudding
                isAvailable: true
            },
            {
                name: "Fresh Orange Juice",
                description: "Squeezed daily.",
                price: 45,
                categoryId: catMap["Drinks"],
                image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            },
            {
                name: "Turkish Coffee",
                description: "Strong and authentic.",
                price: 30,
                categoryId: catMap["Drinks"],
                image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=60",
                isAvailable: true
            }
        ];

        await Product.insertMany(products);

        return NextResponse.json({ success: true, message: "Database seeded successfully!" });
    } catch (error) {
        console.error("Seeding error:", error);
        return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
    }
}
