import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role, Status, Visibility } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter, log: ["error"] });

const SALT_ROUNDS = 10;
const DAY = 86_400_000;

function daysAgo(min: number, max: number): Date {
  const days = Math.random() * (max - min) + min;
  return new Date(Date.now() - days * DAY);
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;
const avatar = (n: number) => `https://i.pravatar.cc/300?img=${n}`;

const FOOD_IMAGE_IDS = [
  "1546069901-ba9599a7e63c",
  "1567620905732-2d1ec7ab7445",
  "1565299624946-b28f40a0ae38",
  "1568901346375-23c9450c58cd",
  "1512621776951-a57141f2eefd",
  "1540189549336-e6e99c3679fe",
  "1476224203421-9ac39bcb3327",
  "1495521821757-a1efb6729352",
  "1504674900247-0877df9cc836",
  "1517248135467-4c7edcad34c4",
  "1473093295043-cdd812d0e601",
  "1555939594-58d7cb561ad1",
  "1547592180-85f173990554",
  "1476718406336-bb5a9690ee2a",
  "1490645935967-10de6ba17061",
  "1512058564366-18510be2db19",
  "1563379926898-05f4575a45d8",
  "1484723091739-30a097e8f929",
  "1551024506-0bccd828d307",
  "1563805042-7684c019e1cb",
  "1556910103-1c02745aae4d",
  "1467003909585-2f8a72700288",
  "1544025162-d76694265947",
  "1571091718767-18b5b1457add",
  "1519708227418-c8fd9a32b7a2",
  "1414235077428-338989a2e8c0",
  "1543353071-873f17a7a088",
  "1585032226651-759b368d7246",
];

const CATEGORY_NAMES = [
  "Breakfast",
  "Chicken",
  "Dessert",
  "Grilled",
  "Pasta",
  "Quick & Easy",
  "Salad",
  "Seafood",
  "Soup",
  "Vegetarian",
];

// ---------------------------------------------------------------- users (25)
const USER_DATA = [
  {
    name: "Zunaid",
    email: "programmer.zunaid@gmail.com",
    image: avatar(32),
    role: Role.ADMIN,
    password: "secret123",
  },
  {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    image: avatar(47),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "James Carter",
    email: "james.carter@example.com",
    image: avatar(12),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    image: avatar(44),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Marco Rossi",
    email: "marco.rossi@example.com",
    image: avatar(13),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Emily Nguyen",
    email: "emily.nguyen@example.com",
    image: avatar(25),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    image: avatar(53),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Ayesha Rahman",
    email: "ayesha.rahman@example.com",
    image: avatar(59),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Tom Becker",
    email: "tom.becker@example.com",
    image: avatar(68),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Rachel Adams",
    email: "rachel.adams@example.com",
    image: avatar(41),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Omar Hassan",
    email: "omar.hassan@example.com",
    image: avatar(60),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Chloe Martin",
    email: "chloe.martin@example.com",
    image: avatar(24),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Daniel Ortiz",
    email: "daniel.ortiz@example.com",
    image: avatar(6),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Mia Chen",
    email: "mia.chen@example.com",
    image: avatar(33),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Noah Williams",
    email: "noah.williams@example.com",
    image: avatar(15),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Fatima Khan",
    email: "fatima.khan@example.com",
    image: avatar(55),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Lucas Silva",
    email: "lucas.silva@example.com",
    image: avatar(61),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Emma Brown",
    email: "emma.brown@example.com",
    image: avatar(45),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Ethan Park",
    email: "ethan.park@example.com",
    image: avatar(20),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Sofia Garcia",
    email: "sofia.garcia@example.com",
    image: avatar(16),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Jack Wilson",
    email: "jack.wilson@example.com",
    image: avatar(28),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Layla Ahmed",
    email: "layla.ahmed@example.com",
    image: avatar(58),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Oliver Smith",
    email: "oliver.smith@example.com",
    image: avatar(5),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Ava Thompson",
    email: "ava.thompson@example.com",
    image: avatar(26),
    role: Role.USER,
    password: "Flavora@123",
  },
  {
    name: "Ryan Cooper",
    email: "ryan.cooper@example.com",
    image: avatar(67),
    role: Role.USER,
    password: "Flavora@123",
  },
];

// `author` is an index into USER_DATA (1-24, never the admin at 0)
const RECIPE_DATA: {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  category: string;
  author: number;
  image: string;
}[] = [
  {
    title: "Margherita Pizza",
    category: "Quick & Easy",
    author: 1,
    image: img("1565299624946-b28f40a0ae38"),
    description:
      "A classic Neapolitan-style pizza with a blistered crust, sweet tomato sauce, and fresh mozzarella.",
    ingredients: [
      "1 pizza dough ball",
      "200g crushed tomatoes",
      "150g fresh mozzarella",
      "Fresh basil leaves",
      "2 tbsp olive oil",
      "1 tsp salt",
    ],
    instructions:
      "Preheat oven as hot as possible. Stretch dough, spread tomato sauce, top with torn mozzarella and a drizzle of olive oil. Bake until blistered, then finish with fresh basil and salt.",
  },
  {
    title: "Classic Beef Burger",
    category: "Grilled",
    author: 2,
    image: img("1568901346375-23c9450c58cd"),
    description:
      "Juicy grilled beef patties with melted cheddar, lettuce, tomato, and a smoky secret sauce.",
    ingredients: [
      "500g ground beef (80/20)",
      "4 burger buns",
      "4 slices cheddar",
      "1 tomato, sliced",
      "Lettuce leaves",
      "2 tbsp mayo",
      "1 tbsp ketchup",
      "1 tsp smoked paprika",
    ],
    instructions:
      "Form loose patties and season generously. Grill over high heat to your liking, add cheese to melt. Toast buns, spread sauce, and stack with lettuce and tomato.",
  },
  {
    title: "Creamy Garlic Parmesan Pasta",
    category: "Pasta",
    author: 3,
    image: img("1473093295043-cdd812d0e601"),
    description:
      "Silky fettuccine tossed in a rich garlic parmesan cream sauce — comfort in a bowl.",
    ingredients: [
      "300g fettuccine",
      "4 garlic cloves, minced",
      "1 cup heavy cream",
      "1 cup grated parmesan",
      "2 tbsp butter",
      "Black pepper",
      "Parsley to garnish",
    ],
    instructions:
      "Cook pasta al dente. Melt butter, sauté garlic, add cream and simmer. Whisk in parmesan, toss pasta, season with pepper, and garnish with parsley.",
  },
  {
    title: "Fluffy Berry Pancakes",
    category: "Breakfast",
    author: 5,
    image: img("1567620905732-2d1ec7ab7445"),
    description:
      "Light and fluffy pancakes topped with a medley of fresh berries and maple syrup.",
    ingredients: [
      "1.5 cups flour",
      "2 tbsp sugar",
      "1 tbsp baking powder",
      "1 egg",
      "1.25 cups milk",
      "2 tbsp melted butter",
      "Fresh berries",
      "Maple syrup",
    ],
    instructions:
      "Whisk dry ingredients, then fold in wet until just combined. Cook on a hot griddle until bubbles form, flip, and serve with berries and syrup.",
  },
  {
    title: "Roasted Veggie Buddha Bowl",
    category: "Vegetarian",
    author: 7,
    image: img("1540189549336-e6e99c3679fe"),
    description:
      "A vibrant bowl of roasted seasonal vegetables, quinoa, avocado, and tahini drizzle.",
    ingredients: [
      "1 cup quinoa",
      "1 sweet potato, cubed",
      "1 zucchini, sliced",
      "1 cup broccoli florets",
      "1 avocado",
      "2 tbsp tahini",
      "1 lemon",
      "Olive oil & spices",
    ],
    instructions:
      "Roast vegetables with olive oil and spices until caramelized. Cook quinoa, then assemble bowls with avocado and a tahini-lemon dressing.",
  },
  {
    title: "Lemon Herb Chicken Skewers",
    category: "Grilled",
    author: 4,
    image: img("1555939594-58d7cb561ad1"),
    description:
      "Charred chicken skewers marinated in lemon, garlic, and fresh herbs — perfect for the grill.",
    ingredients: [
      "600g chicken breast, cubed",
      "3 lemons (juice + zest)",
      "4 garlic cloves",
      "2 tbsp olive oil",
      "Fresh oregano & thyme",
      "1 tsp paprika",
      "Salt & pepper",
    ],
    instructions:
      "Marinate chicken in lemon, garlic, herbs, and spices for at least an hour. Thread onto skewers and grill until charred and cooked through.",
  },
  {
    title: "Roasted Butternut Squash Soup",
    category: "Soup",
    author: 8,
    image: img("1547592180-85f173990554"),
    description:
      "Velvety butternut squash soup with a hint of nutmeg and crispy sage.",
    ingredients: [
      "1 butternut squash",
      "1 onion, chopped",
      "3 cups vegetable stock",
      "1 cup coconut milk",
      "1 tsp nutmeg",
      "Sage leaves",
      "2 tbsp olive oil",
    ],
    instructions:
      "Roast squash until tender. Sauté onion, add squash and stock, simmer, then blend until silky. Stir in coconut milk and season with nutmeg.",
  },
  {
    title: "Pan-Seared Salmon with Lemon Butter",
    category: "Seafood",
    author: 1,
    image: img("1467003909585-2f8a72700288"),
    description:
      "Crispy-skinned salmon fillets finished in a bright lemon-caper butter sauce.",
    ingredients: [
      "4 salmon fillets",
      "3 tbsp butter",
      "2 tbsp capers",
      "1 lemon",
      "2 garlic cloves",
      "Fresh dill",
      "Salt & pepper",
    ],
    instructions:
      "Pat salmon dry and sear skin-side down until crisp. Flip, add butter, garlic, capers, and lemon. Baste and serve with fresh dill.",
  },
  {
    title: "Silky Chocolate Mousse",
    category: "Dessert",
    author: 3,
    image: img("1551024506-0bccd828d307"),
    description:
      "An indulgent, airy dark chocolate mousse with whipped cream and cocoa.",
    ingredients: [
      "200g dark chocolate",
      "3 eggs",
      "2 tbsp sugar",
      "1 cup heavy cream",
      "1 tsp vanilla",
      "Cocoa powder",
    ],
    instructions:
      "Melt chocolate. Whisk yolks with sugar, fold into chocolate, then fold in whipped cream and beaten egg whites. Chill and dust with cocoa.",
  },
  {
    title: "Honey-Glazed BBQ Ribs",
    category: "Grilled",
    author: 6,
    image: img("1544025162-d76694265947"),
    description:
      "Fall-off-the-bone ribs lacquered in a sticky honey barbecue glaze.",
    ingredients: [
      "1.5kg pork ribs",
      "1 cup BBQ sauce",
      "1/4 cup honey",
      "2 tbsp soy sauce",
      "1 tsp garlic powder",
      "Smoked paprika",
    ],
    instructions:
      "Rub ribs with spices and slow-roast until tender. Mix glaze, brush generously, and finish on the grill until caramelized.",
  },
  {
    title: "Creamy Chickpea Curry",
    category: "Vegetarian",
    author: 7,
    image: img("1490645935967-10de6ba17061"),
    description:
      "A fragrant, creamy chickpea curry simmered with tomatoes, coconut, and warm spices.",
    ingredients: [
      "2 cans chickpeas",
      "1 onion, diced",
      "3 garlic cloves",
      "1 tbsp ginger",
      "1 can crushed tomatoes",
      "1 cup coconut milk",
      "2 tbsp curry powder",
      "Fresh cilantro",
    ],
    instructions:
      "Sauté onion, garlic, and ginger. Add spices, tomatoes, and chickpeas. Simmer with coconut milk, then garnish with cilantro.",
  },
  {
    title: "Chicken Veggie Stir-Fry",
    category: "Chicken",
    author: 2,
    image: img("1512058564366-18510be2db19"),
    description:
      "Quick weeknight stir-fry with tender chicken, colorful veggies, and a glossy soy-ginger sauce.",
    ingredients: [
      "400g chicken, sliced",
      "1 red bell pepper",
      "1 cup broccoli",
      "1 carrot, julienned",
      "3 tbsp soy sauce",
      "1 tbsp honey",
      "1 tbsp ginger, grated",
      "2 cups cooked rice",
    ],
    instructions:
      "Stir-fry chicken until golden, add vegetables, and toss with a soy-honey-ginger sauce. Serve over steamed rice.",
  },
  {
    title: "Garlic Shrimp Fried Rice",
    category: "Seafood",
    author: 4,
    image: img("1563379926898-05f4575a45d8"),
    description:
      "Wok-fired rice with garlic shrimp, scrambled egg, and scallions — better than takeout.",
    ingredients: [
      "300g shrimp, peeled",
      "3 cups cooked rice",
      "2 eggs",
      "4 garlic cloves",
      "1 cup peas & carrots",
      "3 tbsp soy sauce",
      "1 tbsp sesame oil",
      "Scallions",
    ],
    instructions:
      "Sear shrimp, scramble eggs, then stir-fry rice with garlic and vegetables. Toss everything with soy sauce and sesame oil.",
  },
  {
    title: "Fresh Caprese Salad",
    category: "Salad",
    author: 5,
    image: img("1512621776951-a57141f2eefd"),
    description:
      "Ripe tomatoes, creamy mozzarella, and basil dressed with olive oil and balsamic.",
    ingredients: [
      "4 ripe tomatoes",
      "250g fresh mozzarella",
      "Fresh basil leaves",
      "3 tbsp olive oil",
      "1 tbsp balsamic glaze",
      "Sea salt",
      "Black pepper",
    ],
    instructions:
      "Layer tomato and mozzarella slices with basil. Drizzle with olive oil and balsamic, then finish with salt and pepper.",
  },
  {
    title: "Spicy Beef Taco Bowl",
    category: "Quick & Easy",
    author: 6,
    image: img("1543353071-873f17a7a088"),
    description:
      "A deconstructed taco night — seasoned beef over cilantro-lime rice with all the toppings.",
    ingredients: [
      "400g ground beef",
      "2 tbsp taco seasoning",
      "2 cups cooked rice",
      "1 lime",
      "1 avocado",
      "1/2 cup cherry tomatoes",
      "Sour cream",
      "Cilantro",
    ],
    instructions:
      "Brown beef and season. Toss rice with lime and cilantro, then build bowls with avocado, tomatoes, and a dollop of sour cream.",
  },
  {
    title: "Avocado Toast with Poached Egg",
    category: "Breakfast",
    author: 8,
    image: img("1476718406336-bb5a9690ee2a"),
    description:
      "Sourdough toast topped with smashed avocado, a jammy poached egg, and chili flakes.",
    ingredients: [
      "2 slices sourdough",
      "1 ripe avocado",
      "2 eggs",
      "1 lemon",
      "Red chili flakes",
      "Olive oil",
      "Salt & pepper",
    ],
    instructions:
      "Toast bread, smash avocado with lemon. Poach eggs, place over avocado, and finish with chili flakes and olive oil.",
  },
  {
    title: "Grilled Cheese & Tomato Soup Duo",
    category: "Soup",
    author: 1,
    image: img("1414235077428-338989a2e8c0"),
    description:
      "A creamy roasted tomato soup served with a gooey, golden grilled cheese sandwich.",
    ingredients: [
      "1 can whole tomatoes",
      "1 onion",
      "2 garlic cloves",
      "2 cups stock",
      "1/2 cup cream",
      "4 slices bread",
      "150g cheddar",
      "Butter",
    ],
    instructions:
      "Simmer tomatoes with onion and garlic, blend, and stir in cream. Butter bread, fill with cheddar, and toast until golden. Serve together.",
  },
  {
    title: "Classic French Toast",
    category: "Breakfast",
    author: 3,
    image: img("1484723091739-30a097e8f929"),
    description:
      "Thick brioche slices soaked in a cinnamon-vanilla custard and griddled golden.",
    ingredients: [
      "4 slices brioche",
      "2 eggs",
      "1/2 cup milk",
      "1 tsp cinnamon",
      "1 tsp vanilla",
      "Butter",
      "Maple syrup",
    ],
    instructions:
      "Whisk eggs, milk, cinnamon, and vanilla. Soak bread, then griddle in butter until golden. Serve with maple syrup.",
  },
  {
    title: "Strawberry No-Churn Ice Cream",
    category: "Dessert",
    author: 5,
    image: img("1563805042-7684c019e1cb"),
    description:
      "Creamy homemade strawberry ice cream without an ice cream maker.",
    ingredients: [
      "2 cups heavy cream",
      "1 can sweetened condensed milk",
      "1.5 cups strawberries",
      "1 tsp vanilla",
      "1 tbsp lemon juice",
    ],
    instructions:
      "Whip cream to stiff peaks, fold in condensed milk and vanilla. Swirl in mashed strawberries, then freeze until set.",
  },
  {
    title: "Sunday Roast Chicken",
    category: "Chicken",
    author: 4,
    image: img("1504674900247-0877df9cc836"),
    description:
      "A perfectly golden roast chicken with crispy skin, juicy meat, and roasted vegetables.",
    ingredients: [
      "1 whole chicken (1.5kg)",
      "4 garlic cloves",
      "1 lemon",
      "Fresh rosemary & thyme",
      "2 tbsp butter",
      "3 carrots",
      "4 potatoes",
      "Olive oil",
    ],
    instructions:
      "Rub chicken with butter, herbs, and lemon. Roast with potatoes and carrots until the skin is crispy and juices run clear.",
  },
];

// ------------------------------------------------- generated recipe pools
const GENERATED_TITLES: Record<string, string[]> = {
  Breakfast: [
    "Banana Oat Pancakes",
    "Veggie Egg Omelette",
    "Greek Yogurt Parfait",
    "Breakfast Burrito",
    "Blueberry Muffins",
    "Shakshuka",
    "Cinnamon Roll Muffins",
    "Savory Breakfast Bowl",
  ],
  Chicken: [
    "Honey Garlic Chicken Thighs",
    "Lemon Pepper Chicken Wings",
    "Teriyaki Chicken Rice Bowl",
    "Cajun Chicken Alfredo",
    "Coq au Vin",
    "Butter Chicken",
    "Chicken Parmesan",
    "Buffalo Chicken Tacos",
  ],
  Dessert: [
    "Tiramisu",
    "Lemon Bars",
    "Red Velvet Cake",
    "Creme Brulee",
    "Apple Crumble",
    "Fudgy Brownies",
    "Panna Cotta",
    "Baklava",
  ],
  Grilled: [
    "Grilled Lamb Chops with Rosemary",
    "BBQ Pulled Pork Sandwich",
    "Grilled Steak Fajitas",
    "Smoky Chipotle Burgers",
    "Grilled Halloumi Skewers",
    "Tandoori Chicken Skewers",
    "Grilled Pork Chops with Apple",
    "Charred Corn on the Cob",
  ],
  Pasta: [
    "Spaghetti Carbonara",
    "Penne Arrabbiata",
    "Lemon Ricotta Ravioli",
    "Pesto Genovese",
    "Baked Ziti",
    "Shrimp Scampi Linguine",
    "Truffle Mac & Cheese",
    "Lasagna Bolognese",
  ],
  "Quick & Easy": [
    "15-Minute Garlic Butter Shrimp",
    "One-Pot Cheesy Pasta",
    "Sheet Pan Fajitas",
    "5-Ingredient Chili",
    "Quick Egg Fried Rice",
    "Avocado Chicken Wraps",
    "Crispy Quesadillas",
    "Garlic Herb Roasted Potatoes",
  ],
  Salad: [
    "Classic Caesar Salad",
    "Greek Salad with Feta",
    "Kale & Quinoa Salad",
    "Waldorf Salad",
    "Thai Beef Salad",
    "Watermelon Feta Salad",
    "Garden Cobb Salad",
    "Chickpea Avocado Salad",
  ],
  Seafood: [
    "Garlic Butter Prawns",
    "Fish Tacos with Slaw",
    "Lemon Garlic Tilapia",
    "Miso Glazed Cod",
    "Seafood Paella",
    "Tuna Poke Bowl",
    "Grilled Lobster Tail",
    "New England Clam Chowder",
  ],
  Soup: [
    "Creamy Tomato Basil Soup",
    "Chicken Noodle Soup",
    "Hearty Lentil Soup",
    "Thai Coconut Soup",
    "French Onion Soup",
    "Minestrone",
    "Creamy Pumpkin Soup",
    "Wonton Soup",
  ],
  Vegetarian: [
    "Sweet Potato Curry",
    "Stuffed Bell Peppers",
    "Cauliflower Tikka Masala",
    "Zucchini Noodle Alfredo",
    "Lentil Shepherd's Pie",
    "Mediterranean Quinoa Salad",
    "Creamy Mushroom Risotto",
    "Hearty Veggie Burger",
  ],
};

const ING_POOL: Record<string, string[]> = {
  Breakfast: [
    "2 cups all-purpose flour",
    "2 eggs",
    "1 cup milk",
    "2 tbsp sugar",
    "1 tsp baking powder",
    "1 ripe banana, mashed",
    "1 cup rolled oats",
    "1/2 cup blueberries",
    "1 tsp cinnamon",
    "4 slices bread",
    "1 bell pepper, diced",
    "1 cup baby spinach",
    "1 cup Greek yogurt",
    "1/4 cup honey",
    "1 cup strawberries",
    "1/2 cup granola",
    "1 tbsp vanilla extract",
    "Butter for the pan",
  ],
  Chicken: [
    "600g chicken thighs",
    "4 garlic cloves, minced",
    "1 tbsp olive oil",
    "2 tbsp soy sauce",
    "1 cup chicken stock",
    "1 onion, sliced",
    "1 tsp smoked paprika",
    "1/2 tsp chili flakes",
    "1 tbsp honey",
    "1 lemon, juiced",
    "2 tbsp butter",
    "1/2 cup heavy cream",
    "Fresh thyme",
    "1 cup mushrooms, sliced",
    "2 tbsp tomato paste",
    "1 tsp ground cumin",
    "3 spring onions, sliced",
    "1 red bell pepper, sliced",
  ],
  Dessert: [
    "200g dark chocolate",
    "1 cup heavy cream",
    "3 eggs",
    "1/2 cup sugar",
    "200g cream cheese",
    "1 cup all-purpose flour",
    "1/2 cup butter",
    "1 tsp vanilla extract",
    "1/2 cup lemon juice",
    "1/2 cup powdered sugar",
    "250g mascarpone",
    "1 cup strong espresso",
    "1 pack ladyfingers",
    "2 cups mixed berries",
    "1/2 cup cocoa powder",
    "1 cup crushed biscuits",
    "2 tbsp honey",
    "1 sheet puff pastry",
  ],
  Grilled: [
    "4 pork chops",
    "2 tbsp olive oil",
    "1 tbsp smoked paprika",
    "2 tsp garlic powder",
    "1 tsp onion powder",
    "Salt & black pepper",
    "1 cup BBQ sauce",
    "2 limes, juiced",
    "Fresh cilantro",
    "1 tsp ground cumin",
    "3 chicken thighs",
    "1 tbsp brown sugar",
    "4 bell peppers, quartered",
    "1 red onion, thickly sliced",
    "8 flour tortillas",
    "1 avocado, sliced",
    "1 cup shredded cheese",
    "4 ears of corn",
  ],
  Pasta: [
    "300g spaghetti",
    "1/2 cup grated parmesan",
    "2 eggs",
    "4 garlic cloves",
    "1 cup cherry tomatoes",
    "1/2 cup heavy cream",
    "1 tbsp olive oil",
    "Fresh basil leaves",
    "200g pancetta",
    "1/2 cup pesto",
    "150g ricotta",
    "1 lemon, zested",
    "1 cup marinara sauce",
    "200g mozzarella",
    "1/2 cup breadcrumbs",
    "Pinch of nutmeg",
    "1 tsp chili flakes",
    "250g penne",
  ],
  "Quick & Easy": [
    "300g shrimp, peeled",
    "3 tbsp butter",
    "4 garlic cloves",
    "1 lemon, halved",
    "200g pasta",
    "1 cup shredded cheese",
    "1 can diced tomatoes",
    "400g ground beef",
    "1 packet taco seasoning",
    "2 cups cooked rice",
    "1 avocado",
    "4 tortillas",
    "1 can black beans",
    "1 cup corn kernels",
    "2 eggs",
    "1 tbsp soy sauce",
    "2 cups frozen mixed veggies",
    "8 cherry tomatoes",
  ],
  Salad: [
    "1 head romaine lettuce",
    "1/2 cup grated parmesan",
    "4 slices sourdough",
    "2 tbsp mayonnaise",
    "1 lemon, juiced",
    "4 ripe tomatoes",
    "1 cucumber",
    "1 red onion, thinly sliced",
    "150g feta cheese",
    "1 cup kalamata olives",
    "1 cup quinoa",
    "2 cups kale, shredded",
    "1 apple, diced",
    "1/2 cup walnuts",
    "200g grilled beef strips",
    "1/2 watermelon, cubed",
    "2 avocados, sliced",
    "4 hard-boiled eggs",
  ],
  Seafood: [
    "400g raw prawns",
    "3 tbsp butter",
    "4 garlic cloves",
    "1 lemon",
    "2 tbsp olive oil",
    "4 white fish fillets",
    "1 cup panko breadcrumbs",
    "1/2 cup all-purpose flour",
    "8 small tortillas",
    "1 cup cabbage slaw",
    "1 tbsp miso paste",
    "2 tbsp mirin",
    "1 cup sushi rice",
    "1 avocado",
    "1/2 cup ponzu sauce",
    "1 cup clam broth",
    "1 tsp saffron",
    "Fresh dill",
  ],
  Soup: [
    "1 can crushed tomatoes",
    "2 cups vegetable stock",
    "1 onion, chopped",
    "3 garlic cloves",
    "1/2 cup heavy cream",
    "Fresh basil",
    "200g chicken breast",
    "1 cup egg noodles",
    "1 cup red lentils",
    "1 can coconut milk",
    "2 tbsp red curry paste",
    "2 large onions",
    "1 cup grated gruyere",
    "1 cup pumpkin puree",
    "1 tsp nutmeg",
    "1 cup green beans",
    "1 cup diced carrots",
    "1 celery stalk, diced",
  ],
  Vegetarian: [
    "2 sweet potatoes, cubed",
    "1 can chickpeas",
    "1 can coconut milk",
    "2 tbsp curry paste",
    "1 cup basmati rice",
    "3 bell peppers",
    "1 cup quinoa",
    "1 head cauliflower",
    "1 cup marinara sauce",
    "150g mozzarella",
    "2 zucchinis, spiralized",
    "1 cup green lentils",
    "2 cups vegetable stock",
    "1 cup mushrooms, sliced",
    "1/2 cup arborio rice",
    "1/2 cup fresh parsley",
    "1 lemon",
    "1 avocado",
  ],
};

const INSTRUCTION_POOL = [
  "Prep all ingredients first. Heat oil in a large pan over medium-high heat and cook the aromatics until fragrant. Add the main component and cook until golden, then pour in the sauce or stock and simmer until thickened. Season with salt and pepper, then serve immediately.",
  "Start by seasoning the protein generously. Sear it in a hot pan with a little oil until browned on all sides, then set aside. Sauté the vegetables in the same pan, return the protein, and finish with your sauce. Rest briefly before serving.",
  "Preheat your oven. Arrange everything in a baking dish, drizzle with oil, and season well. Roast until the top is golden and the contents are bubbling. Let it cool for a few minutes, then serve straight from the dish.",
  "Cook the base according to the package instructions. Meanwhile, prepare the sauce in a separate pan, melting butter and whisking in the remaining ingredients. Combine, toss well, and garnish before serving.",
  "Blend or mash the main ingredients until smooth, thinning with stock or cream as needed. Warm through over low heat, taste, and adjust the seasoning. Serve with a drizzle of oil and fresh herbs.",
  "Mix the dry ingredients in one bowl and the wet in another, then fold them together until just combined. Cook in a greased pan until golden and cooked through. Serve warm with your favorite toppings.",
  "Marinate the main ingredient for at least 30 minutes. Grill or pan-sear over high heat until charred and cooked through. Let it rest, then slice and serve with a fresh squeeze of citrus.",
  "Layer the components in a serving dish, adding seasoning between each layer. Chill or bake as needed until set. Finish with a garnish and a crack of black pepper.",
];

const REVIEW_POOL = [
  { rating: 5, comment: "Absolutely delicious — this has become a weekly staple in our house." },
  { rating: 5, comment: "Followed exactly and it turned out perfect. Will make again!" },
  { rating: 4, comment: "Really good. I added a little extra seasoning and it was fantastic." },
  { rating: 4, comment: "Great flavors and easy to follow. The family loved it." },
  { rating: 3, comment: "Decent, but I'd cut the cooking time a bit next time." },
  { rating: 5, comment: "Better than any restaurant version I've tried. Highly recommend." },
  { rating: 4, comment: "Quick, simple, and the whole kitchen smelled amazing." },
  { rating: 5, comment: "My kids asked for seconds. Enough said." },
  { rating: 4, comment: "Beautiful presentation and it tasted even better than it looked." },
  { rating: 5, comment: "I doubled the recipe and it still came out perfect. Crowd pleaser!" },
  { rating: 3, comment: "Tasty, though I'd dial back the salt next time." },
  { rating: 4, comment: "Great weeknight dinner — not too fussy, big payoff." },
  { rating: 5, comment: "This is going in my regular rotation. So good." },
  { rating: 2, comment: "Was a bit dry for my taste, but the flavor was nice." },
  { rating: 4, comment: "Loved the textures. Will try the suggested variations." },
  { rating: 5, comment: "Surprisingly easy and restaurant-quality. Thank you!" },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.$transaction([
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.recipe.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Creating categories…");
  const categoryId: Record<string, string> = {};
  for (const name of CATEGORY_NAMES) {
    const category = await prisma.category.create({
      data: { name, status: Status.ACTIVE, createdAt: daysAgo(90, 30) },
    });
    categoryId[name] = category.id;
  }

  console.log("Creating users…");
  const userPass = await bcrypt.hash("Flavora@123", SALT_ROUNDS);
  const adminPass = await bcrypt.hash("secret123", SALT_ROUNDS);
  const users = [];
  for (const u of USER_DATA) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        status: Status.ACTIVE,
        password: u.role === Role.ADMIN ? adminPass : userPass,
        createdAt: daysAgo(90, 20),
      },
    });
    users.push(user);
  }
  console.log(`  ${users.length} users (admin: ${USER_DATA[0].email})`);

  console.log("Creating recipes…");
  const recipes = [];
  const recipeAuthors: string[] = [];

  for (const r of RECIPE_DATA) {
    const recipe = await prisma.recipe.create({
      data: {
        title: r.title,
        description: r.description,
        ingredients: r.ingredients,
        instructions: r.instructions,
        image: r.image,
        visibility: Visibility.PUBLIC,
        status: Status.ACTIVE,
        categoryId: categoryId[r.category],
        authorId: users[r.author].id,
        createdAt: daysAgo(70, 2),
      },
    });
    recipes.push(recipe);
    recipeAuthors.push(users[r.author].id);
  }

  // top up every category to 8 recipes using the generated pools
  let generated = 0;
  for (const category of CATEGORY_NAMES) {
    const existing = RECIPE_DATA.filter((r) => r.category === category).length;
    const need = Math.max(0, 8 - existing);
    const titles = GENERATED_TITLES[category];
    for (let i = 0; i < need; i++) {
      const seed = generated * 7 + i;
      const pool = ING_POOL[category];
      const ingredients = Array.from(
        { length: 6 },
        (_, k) => pool[(seed + k * 3) % pool.length]
      );
      const authorIdx = 1 + (generated % (users.length - 1));
      const recipe = await prisma.recipe.create({
        data: {
          title: titles[i % titles.length],
          description: `A crowd-pleasing ${category.toLowerCase()} dish that comes together quickly and always delivers on flavor.`,
          ingredients,
          instructions: INSTRUCTION_POOL[seed % INSTRUCTION_POOL.length],
          image: img(FOOD_IMAGE_IDS[seed % FOOD_IMAGE_IDS.length]),
          visibility:
            generated === 11 || generated === 23
              ? Visibility.PRIVATE
              : Visibility.PUBLIC,
          status: Status.ACTIVE,
          categoryId: categoryId[category],
          authorId: users[authorIdx].id,
          createdAt: daysAgo(70, 2),
        },
      });
      recipes.push(recipe);
      recipeAuthors.push(users[authorIdx].id);
      generated++;
    }
  }
  console.log(`  ${recipes.length} recipes (${recipes.length - RECIPE_DATA.length} generated)`);

  console.log("Creating reviews…");
  const reviewers = users.filter((u) => u.role === Role.USER);
  const reviewRows: {
    rating: number;
    comment: string;
    userId: string;
    recipeId: string;
    createdAt: Date;
  }[] = [];
  for (let i = 0; i < recipes.length; i++) {
    const available = reviewers.filter((u) => u.id !== recipeAuthors[i]);
    const nReviews = 2 + (i % 3);
    for (let j = 0; j < nReviews; j++) {
      const pool = REVIEW_POOL[(i * 3 + j) % REVIEW_POOL.length];
      reviewRows.push({
        rating: pool.rating,
        comment: pool.comment,
        userId: available[(i + j) % available.length].id,
        recipeId: recipes[i].id,
        createdAt: daysAgo(30, 0),
      });
    }
  }
  await prisma.review.createMany({ data: reviewRows });
  console.log(`  ${reviewRows.length} reviews`);

  console.log("Creating favorites…");
  const ownerOf = new Map<string, number>(); // recipeId -> user index
  RECIPE_DATA.forEach((r, idx) => ownerOf.set(recipes[idx].id, r.author));
  for (let g = 0; g < generated; g++) {
    ownerOf.set(recipes[RECIPE_DATA.length + g].id, 1 + (g % (users.length - 1)));
  }
  const favSeen = new Set<string>();
  const favRows: { userId: string; recipeId: string; createdAt: Date }[] = [];
  for (let u = 1; u < users.length; u++) {
    let attempts = 0;
    while (favRows.length - (u === 1 ? 0 : 0) < u * 6 && attempts < 200) {
      attempts++;
      const idx = Math.floor(Math.random() * recipes.length);
      if (ownerOf.get(recipes[idx].id) === u) continue;
      const key = `${users[u].id}:${recipes[idx].id}`;
      if (favSeen.has(key)) continue;
      favSeen.add(key);
      favRows.push({
        userId: users[u].id,
        recipeId: recipes[idx].id,
        createdAt: daysAgo(30, 0),
      });
    }
  }
  await prisma.favorite.createMany({ data: favRows });
  console.log(`  ${favRows.length} favorites`);

  const summary = await prisma.$transaction([
    prisma.user.count(),
    prisma.category.count(),
    prisma.recipe.count(),
    prisma.review.count(),
    prisma.favorite.count(),
  ]);
  console.log("\n=== Seed complete ===");
  console.log(
    `Users: ${summary[0]} | Categories: ${summary[1]} | Recipes: ${summary[2]} | Reviews: ${summary[3]} | Favorites: ${summary[4]}`
  );
  console.log("Seeded user password: Flavora@123 | Admin: secret123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
