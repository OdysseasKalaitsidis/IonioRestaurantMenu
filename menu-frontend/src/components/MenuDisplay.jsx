import { useState, useEffect } from "react";

export default function MenuDisplay() {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    // Get current day of week
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = new Date();
    const dayOfWeek = days[today.getDay()];
    setCurrentDay(dayOfWeek);

    // Fetch menu data from the API
    const fetchMenuData = async () => {
      try {
        const response = await fetch(
          "https://ioniorestaurantmenu.onrender.com/menu"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch menu data");
        }
        const data = await response.json();
        setMenuData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Function to capitalize the first letter of a string
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold">No menu data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Daily Menu</h1>
        <p className="text-lg text-gray-600">{menuData.menu_period}</p>
        <p className="text-xl font-medium mt-2 text-green-700">
          Today: {capitalize(currentDay)}, {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lunch Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
            Lunch
          </h2>
          {menuData.meals.lunch[currentDay] &&
          menuData.meals.lunch[currentDay].length > 0 ? (
            <ul className="space-y-2">
              {menuData.meals.lunch[currentDay].map((item, index) => (
                <li
                  key={`lunch-${index}`}
                  className="pl-4 border-l-4 border-yellow-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-500">
              No lunch items available for today
            </p>
          )}
        </div>

        {/* Dinner Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
            Dinner
          </h2>
          {menuData.meals.dinner[currentDay] &&
          menuData.meals.dinner[currentDay].length > 0 ? (
            <ul className="space-y-2">
              {menuData.meals.dinner[currentDay].map((item, index) => (
                <li
                  key={`dinner-${index}`}
                  className="pl-4 border-l-4 border-green-500"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-500">
              No dinner items available for today
            </p>
          )}
        </div>
      </div>

      {/* Extras Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
          Extras
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuData.extras.dessert && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">🍰</span>
              <span>
                <b>Dessert:</b> {menuData.extras.dessert}
              </span>
            </div>
          )}
          {menuData.extras.first_course && (
            <div className="flex items-center">
              <span className="text-orange-500 mr-2">🍲</span>
              <span>
                <b>First course</b> included
              </span>
            </div>
          )}
          {menuData.extras.salad_or_feta && (
            <div className="flex items-center">
              <span className="text-green-500 mr-2">🥗</span>
              <span>
                <b>Salad or feta cheese</b> included
              </span>
            </div>
          )}
          {menuData.extras.vegetarian_menu && (
            <div className="flex items-center">
              <span className="text-green-600 mr-2">🌱</span>
              <span>
                <b>Vegetarian options</b> available
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
