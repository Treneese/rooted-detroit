import { useEffect, useMemo, useState } from "react";
import { getMemberPlans } from "../api/rootedApi";

const RECIPES = [
  {
    id: 1,
    title: "Detroit Power Bowl",
    meal: "Lunch",
    icon: "🥗",
    time: "20 min",
    difficulty: "Easy",
    cost: "Budget friendly",
    tags: ["Plant-forward", "High fiber", "Whole foods"],
    description:
      "Roasted vegetables, greens, chickpeas, whole grains, and a bright lemon-herb dressing.",
    ingredients: [
      "2 cups mixed greens",
      "1/2 cup cooked brown rice or quinoa",
      "1/2 cup chickpeas",
      "1 cup roasted vegetables",
      "1/4 avocado",
      "Fresh herbs",
      "Lemon-herb dressing",
    ],
    steps: [
      "Add greens to a bowl.",
      "Layer in the grain, chickpeas, and roasted vegetables.",
      "Add avocado and fresh herbs.",
      "Finish with the lemon-herb dressing.",
    ],
    why:
      "A simple whole-food meal that combines vegetables, fiber, plant protein, and satisfying carbohydrates.",
  },
  {
    id: 2,
    title: "Healing Vegetable Soup",
    meal: "Dinner",
    icon: "🍲",
    time: "35 min",
    difficulty: "Easy",
    cost: "Budget friendly",
    tags: ["Vegetable-rich", "Hydrating", "Meal prep"],
    description:
      "A warm vegetable and bean soup designed for an easy, nourishing weeknight meal.",
    ingredients: [
      "1 tablespoon olive oil",
      "1 onion",
      "2 carrots",
      "2 celery stalks",
      "2 cups mixed vegetables",
      "1 can white beans",
      "4 cups low-sodium broth",
      "Leafy greens",
      "Herbs and spices",
    ],
    steps: [
      "Sauté onion, carrots, and celery until softened.",
      "Add vegetables, beans, broth, and seasonings.",
      "Simmer until vegetables are tender.",
      "Stir in leafy greens before serving.",
    ],
    why:
      "An approachable way to increase vegetables, beans, fluids, and fiber in one meal.",
  },
  {
    id: 3,
    title: "Berry Oat Breakfast",
    meal: "Breakfast",
    icon: "🫐",
    time: "10 min",
    difficulty: "Easy",
    cost: "Budget friendly",
    tags: ["High fiber", "Quick", "Whole grain"],
    description:
      "Warm oats with berries, seeds, cinnamon, and a simple protein-rich topping.",
    ingredients: [
      "1/2 cup rolled oats",
      "1 cup water or milk of choice",
      "1/2 cup berries",
      "1 tablespoon chia or ground flax",
      "Cinnamon",
      "Plain yogurt or another plan-appropriate protein",
    ],
    steps: [
      "Cook oats according to package directions.",
      "Stir in cinnamon and seeds.",
      "Top with berries.",
      "Add your plan-appropriate protein topping.",
    ],
    why:
      "Combines whole grains, fruit, fiber, and a practical protein source for the morning.",
  },
  {
    id: 4,
    title: "Lemon Herb Chicken Plate",
    meal: "Dinner",
    icon: "🍋",
    time: "30 min",
    difficulty: "Easy",
    cost: "Everyday",
    tags: ["Protein", "Vegetable-rich", "Meal prep"],
    description:
      "Lemon-herb chicken with roasted vegetables and a whole-grain side.",
    ingredients: [
      "Chicken breast or thigh",
      "Lemon",
      "Garlic",
      "Fresh or dried herbs",
      "Mixed vegetables",
      "Brown rice or another whole grain",
      "Olive oil",
    ],
    steps: [
      "Season chicken with lemon, garlic, and herbs.",
      "Roast or sauté until safely cooked through.",
      "Roast vegetables alongside the chicken.",
      "Serve with your whole-grain side.",
    ],
    why:
      "A balanced plate format that makes protein, vegetables, and whole grains easy to combine.",
  },
  {
    id: 5,
    title: "Green Hummus Wrap",
    meal: "Lunch",
    icon: "🥬",
    time: "10 min",
    difficulty: "Easy",
    cost: "Budget friendly",
    tags: ["Quick", "Plant-forward", "Portable"],
    description:
      "A quick whole-grain wrap with hummus, greens, cucumber, tomato, and herbs.",
    ingredients: [
      "Whole-grain wrap",
      "Hummus",
      "Mixed greens",
      "Cucumber",
      "Tomato",
      "Fresh herbs",
      "Lemon",
    ],
    steps: [
      "Spread hummus over the wrap.",
      "Add vegetables and herbs.",
      "Squeeze fresh lemon over the filling.",
      "Roll tightly and slice.",
    ],
    why:
      "Useful for busy days when following a whole-food plan needs to stay practical.",
  },
  {
    id: 6,
    title: "Apple Cinnamon Snack Bowl",
    meal: "Snack",
    icon: "🍎",
    time: "5 min",
    difficulty: "Easy",
    cost: "Budget friendly",
    tags: ["Quick", "Fiber", "No cooking"],
    description:
      "Fresh apple, cinnamon, and a plan-appropriate protein or healthy-fat pairing.",
    ingredients: [
      "1 apple",
      "Cinnamon",
      "Plan-appropriate nut or seed butter",
      "Optional seeds",
    ],
    steps: [
      "Slice the apple.",
      "Sprinkle with cinnamon.",
      "Serve with the plan-appropriate pairing.",
    ],
    why:
      "A simple snack that pairs fruit with something more satisfying than fruit alone.",
  },
];

const FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Snack"];

export default function FoodRecipes() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMemberPlans(1);
        setPlans(data);
      } catch (err) {
        setError(err.message || "Unable to load nutrition plan.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.status === "ACTIVE"),
    [plans]
  );

  const nutritionItems = useMemo(() => {
    return (activePlan?.items || []).filter(
      (item) => item.category === "NUTRITION"
    );
  }, [activePlan]);

  const visibleRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return RECIPES.filter((recipe) => {
      const matchesMeal =
        filter === "All" || recipe.meal === filter;

      const haystack = [
        recipe.title,
        recipe.meal,
        recipe.description,
        ...recipe.tags,
        ...recipe.ingredients,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || haystack.includes(query);

      return matchesMeal && matchesSearch;
    });
  }, [filter, search]);

  if (loading) {
    return (
      <main className="dashboard food-page">
        <div className="rooted-loading-card">
          Loading your nutrition guide…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard food-page">
        <div className="rooted-error-card">{error}</div>
      </main>
    );
  }

  return (
    <main className="dashboard food-page">
      <section className="food-hero">
        <div>
          <span className="section-label">
            NUTRITION & RECIPES
          </span>

          <h2>
            Your plan,
            <br />
            on your plate.
          </h2>

          <p>
            Practical meals and food ideas that help make the nutrition
            part of your ROOTED plan easier to follow every day.
          </p>

          <div className="food-hero-tags">
            <span>🥬 Whole foods</span>
            <span>🥕 Practical meals</span>
            <span>🛒 Everyday ingredients</span>
          </div>
        </div>

        <div className="food-plan-card">
          <span className="food-plan-icon">🥗</span>

          <small>YOUR NUTRITION PLAN</small>

          <strong>
            {nutritionItems.length
              ? `${nutritionItems.length} active nutrition ${
                  nutritionItems.length === 1
                    ? "focus"
                    : "focuses"
                }`
              : "Nutrition support"}
          </strong>

          <p>
            Recipes are here to help you put your approved plan into
            everyday practice.
          </p>

          <span className="food-plan-version">
            Plan v{activePlan?.version || "—"}
          </span>
        </div>
      </section>

      {nutritionItems.length > 0 && (
        <section className="nutrition-focus-section">
          <div className="food-section-heading">
            <div>
              <span className="section-label">
                YOUR PLAN
              </span>

              <h3>Your nutrition focus</h3>
            </div>

            <span className="nutrition-approved-pill">
              ✓ Practitioner approved
            </span>
          </div>

          <div className="nutrition-focus-grid">
            {nutritionItems.map((item) => (
              <article
                className="nutrition-focus-card"
                key={item.id}
              >
                <span>🥗</span>

                <div>
                  <small>
                    {item.frequency || "NUTRITION"}
                  </small>

                  <h4>
                    {item.title || "Nutrition support"}
                  </h4>

                  <p>
                    {item.description ||
                      item.instructions ||
                      "Part of your personalized nutrition plan."}
                  </p>

                  {item.instructions && (
                    <div className="nutrition-instruction">
                      <b>What to do</b>
                      <span>{item.instructions}</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="recipe-browser">
        <div className="food-section-heading">
          <div>
            <span className="section-label">
              RECIPES
            </span>

            <h3>What sounds good today?</h3>

            <p>
              Browse simple ideas designed to make whole-health eating
              feel realistic.
            </p>
          </div>

          <div className="recipe-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search recipes or ingredients"
            />
          </div>
        </div>

        <div className="recipe-filters">
          {FILTERS.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {visibleRecipes.length ? (
          <div className="recipe-grid">
            {visibleRecipes.map((recipe) => (
              <article
                className="recipe-card"
                key={recipe.id}
              >
                <button
                  className="recipe-card-main"
                  onClick={() =>
                    setSelectedRecipe(recipe)
                  }
                >
                  <div className="recipe-image-placeholder">
                    <span>{recipe.icon}</span>

                    <div className="recipe-meal-pill">
                      {recipe.meal}
                    </div>
                  </div>

                  <div className="recipe-card-body">
                    <div className="recipe-card-title">
                      <div>
                        <h4>{recipe.title}</h4>
                        <span>
                          {recipe.time} ·{" "}
                          {recipe.difficulty}
                        </span>
                      </div>

                      <b>♡</b>
                    </div>

                    <p>{recipe.description}</p>

                    <div className="recipe-tags">
                      {recipe.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <div className="recipe-card-bottom">
                      <span>💲 {recipe.cost}</span>
                      <strong>View recipe →</strong>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="food-empty-state">
            <span>🥕</span>
            <h4>No recipes found.</h4>
            <p>
              Try another meal type or search term.
            </p>
          </div>
        )}
      </section>

      <section className="food-shopping-section">
        <div>
          <span className="section-label">
            SHOPPING SUPPORT
          </span>

          <h3>Make the plan easier to shop for.</h3>

          <p>
            ROOTED can eventually turn your nutrition plan and selected
            recipes into a practical grocery list that fits your
            household and budget.
          </p>
        </div>

        <div className="shopping-preview">
          <div>
            <span>🥬</span>
            <strong>Produce</strong>
            <small>Greens, vegetables, fruit</small>
          </div>

          <div>
            <span>🫘</span>
            <strong>Protein</strong>
            <small>Beans and plan-appropriate proteins</small>
          </div>

          <div>
            <span>🌾</span>
            <strong>Whole grains</strong>
            <small>Oats, brown rice, quinoa</small>
          </div>

          <div>
            <span>🌿</span>
            <strong>Flavor</strong>
            <small>Herbs, spices, lemon</small>
          </div>
        </div>
      </section>

      <section className="food-rooted-note">
        <span>✦</span>

        <div>
          <small>ROOTED NUTRITION</small>
          <strong>
            Food guidance works with the rest of your health.
          </strong>

          <p>
            Your nutrition plan is one part of the larger picture that
            can include testing, medications, allergies, sleep,
            movement, stress, and natural support.
          </p>
        </div>
      </section>

      {selectedRecipe && (
        <div
          className="recipe-modal-backdrop"
          onClick={() => setSelectedRecipe(null)}
        >
          <article
            className="recipe-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="recipe-modal-close"
              onClick={() =>
                setSelectedRecipe(null)
              }
            >
              ×
            </button>

            <div className="recipe-modal-hero">
              <span>{selectedRecipe.icon}</span>

              <div>
                <small>
                  {selectedRecipe.meal.toUpperCase()}
                </small>

                <h3>{selectedRecipe.title}</h3>

                <p>
                  {selectedRecipe.time} ·{" "}
                  {selectedRecipe.difficulty} ·{" "}
                  {selectedRecipe.cost}
                </p>
              </div>
            </div>

            <div className="recipe-modal-content">
              <section>
                <span className="section-label">
                  WHY THIS FITS
                </span>

                <p>{selectedRecipe.why}</p>

                <div className="recipe-tags">
                  {selectedRecipe.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </section>

              <section>
                <h4>Ingredients</h4>

                <ul>
                  {selectedRecipe.ingredients.map(
                    (ingredient) => (
                      <li key={ingredient}>
                        {ingredient}
                      </li>
                    )
                  )}
                </ul>
              </section>

              <section>
                <h4>Make it</h4>

                <ol>
                  {selectedRecipe.steps.map(
                    (step) => (
                      <li key={step}>{step}</li>
                    )
                  )}
                </ol>
              </section>

              <div className="recipe-plan-note">
                <span>✓</span>

                <p>
                  <strong>
                    Follow your ROOTED plan first.
                  </strong>{" "}
                  Recipes are practical examples for the prototype and
                  should be adapted to the member's actual allergies,
                  medical needs, dietary restrictions, and
                  practitioner guidance.
                </p>
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}