export const EGYPTIAN_MENU_DATA = {
    categories: [
        { _id: "cat_popular", name: "Popular" },
        { _id: "cat_burgers", name: "Burgers" },
        { _id: "cat_egyptian", name: "Egyptian Classics" },
        { _id: "cat_pizza", name: "Pizza" },
        { _id: "cat_desserts", name: "Desserts" },
        { _id: "cat_drinks", name: "Drinks" }
    ],
    products: [
        // Burgers
        {
            _id: "p_burger_1",
            name: "Classic Cheeseburger",
            description: "Juicy beef patty with cheddar cheese, lettuce, tomato, and house sauce.",
            price: 150,
            categoryId: "cat_burgers",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
            isAvailable: true,
            options: [
                { name: "Extra Cheese", price: 20 },
                { name: "Bacon", price: 30 },
                { name: "No Onions", price: 0 }
            ]
        },
        // Egyptian Classics
        {
            _id: "p_eg_1",
            name: "Koshary",
            description: "Egypt's national dish: Rice, lentils, pasta, chickpeas, and spicy tomato sauce.",
            price: 60,
            categoryId: "cat_egyptian",
            image: "https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?auto=format&fit=crop&w=500&q=60",
            isAvailable: true,
            options: [{ name: "Extra Sauce", price: 5 }, { name: "Spicy", price: 0 }]
        },
        {
            _id: "p_eg_2",
            name: "Hawawshi",
            description: "Crispy pita bread stuffed with spiced minced meat.",
            price: 85,
            categoryId: "cat_egyptian",
            image: "https://images.unsplash.com/photo-1628156158223-1d4cf2dc578f?auto=format&fit=crop&w=500&q=60",
            isAvailable: true,
            options: [{ name: "Tahini Dip", price: 10 }]
        },
        {
            _id: "p_eg_3",
            name: "Mix Grill",
            description: "Selection of kofta, shish tawook, and grilled kebab.",
            price: 350,
            categoryId: "cat_egyptian",
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        // Pizza
        {
            _id: "p_pizza_1",
            name: "Margherita Pizza",
            description: "Tomato sauce, fresh mozzarella, and basil.",
            price: 180,
            categoryId: "cat_pizza",
            image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        {
            _id: "p_pizza_2",
            name: "Pepperoni Pizza",
            description: "Spicy pepperoni slices and melted cheese.",
            price: 210,
            categoryId: "cat_pizza",
            image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        // Sides/Popular
        {
            _id: "p_fries",
            name: "Crispy Fries",
            description: "Golden shoestring fries with sea salt.",
            price: 50,
            categoryId: "cat_popular",
            image: "https://images.unsplash.com/photo-1573080496987-a199f8cd75ec?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        // Desserts
        {
            _id: "p_dessert_1",
            name: "Molten Cake",
            description: "Warm chocolate cake with a gooey center.",
            price: 95,
            categoryId: "cat_desserts",
            image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        {
            _id: "p_dessert_2",
            name: "Om Ali",
            description: "Traditional bread pudding with nuts, milk, and cream.",
            price: 70,
            categoryId: "cat_desserts",
            image: "https://images.unsplash.com/photo-1582390315259-22cb15467566?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        // Drinks
        {
            _id: "p_drink_1",
            name: "Fresh Orange Juice",
            description: "Squeezed daily.",
            price: 45,
            categoryId: "cat_drinks",
            image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        {
            _id: "p_drink_2",
            name: "Turkish Coffee",
            description: "Strong and authentic.",
            price: 30,
            categoryId: "cat_drinks",
            image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
        {
            _id: "p_drink_3",
            name: "Chocolate Shake",
            description: "Rich chocolate ice cream blended with milk.",
            price: 75,
            categoryId: "cat_drinks",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=60",
            isAvailable: true
        },
    ]
}
