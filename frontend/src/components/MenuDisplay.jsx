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
  const [openingMessage, setOpeningMessage] = useState("");

  useEffect(() => {
    setOpeningMessage(getNextOpeningMessage());
    const interval = setInterval(() => {
      setOpeningMessage(getNextOpeningMessage());
    }, 60000); // κάθε λεπτό
    return () => clearInterval(interval);
  }, []);

  // Function to capitalize the first letter of a string
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getNextOpeningMessage = () => {
    const now = new Date();
    const openingHours = [
      { start: "13:00", end: "15:30" },
      { start: "18:30", end: "21:00" },
    ];

    const parseTime = (timeStr) => {
      const [h, m] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      return date;
    };

    for (const period of openingHours) {
      const startTime = parseTime(period.start);
      const endTime = parseTime(period.end);

      if (now < startTime) {
        const diffMs = startTime - now;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `Η λέσχη ανοίγει σε ${hours} ώρες και ${minutes} λεπτά.`;
      } else if (now >= startTime && now <= endTime) {
        return "Η λέσχη είναι τώρα ανοιχτή.";
      }
    }

    return "Η λέσχη έχει κλείσει για σήμερα.";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <div className="text-xl font-bold text-gray-700">Loading menu</div>
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
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-700 mb-2">Daily Menu </h1>
          <p className="text-xl font-bold mt-2 text-sky-700">
            {capitalize(currentDay)} {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {/* Lunch Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-red-300">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600 border-b pb-2">
              🍝 Lunch
            </h2>
            {menuData.meals.lunch[currentDay] &&
            menuData.meals.lunch[currentDay].length > 0 ? (
              <ul className="space-y-2">
                {menuData.meals.lunch[currentDay].map((item, index) => (
                  <li
                    key={`lunch-${index}`}
                    className="pl-4 border-l-4 border-cyan-600 text-gray-700"
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
          <div className="bg-white rounded-lg shadow-md p-6 border border-red-300">
            <h2 className="text-2xl font-bold mb-4 text-cyan-600 border-b pb-2">
              🍽️ Dinner
            </h2>
            {menuData.meals.dinner[currentDay] &&
            menuData.meals.dinner[currentDay].length > 0 ? (
              <ul className="space-y-2">
                {menuData.meals.dinner[currentDay].map((item, index) => (
                  <li
                    key={`dinner-${index}`}
                    className="pl-4 border-l-4 border-cyan-600 text-gray-700"
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
          <h2 className="text-2xl font-bold mb-4 text-cyan-600 border-b pb-2">
            Extra
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuData.extras.dessert && (
              <div className="flex items-center text-gray-700">
                <span className="text-yellow-500 mr-2">🍰</span>
                <span>
                  <b>Επιδόρπιο:</b> Επιλογή από φρούτο ή γλυκό
                </span>
              </div>
            )}
            {menuData.extras.first_course && (
              <div className="flex items-center text-gray-700">
                <span className="text-orange-500 mr-2">🍲</span>
                <span>
                  <b>Πρώτο πιάτο</b> περιλαμβάνεται
                </span>
              </div>
            )}
            {menuData.extras.salad_or_feta && (
              <div className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">🥗</span>
                <span>
                  <b>Σαλάτα ή φέτα</b> περιλαμβάνεται
                </span>
              </div>
            )}
            {menuData.extras.vegetarian_menu && (
              <div className="flex items-center text-gray-700">
                <span className="text-green-600 mr-2">🌱</span>
                <span>
                  <b>Χορτοφαγικές επιλογές</b> διαθέσιμες
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-[70%] mx-auto mt-6 p-4 bg-blue-50 border border-blue-300 text-blue-800 rounded-lg text-sm text-center">
        ⏰ {openingMessage}
      </div>
      <div class="w-auto mx-auto mt-64 p-4 bg-yellow-100 text-yellow-800 rounded-xl shadow-sm">
        <p class="text-sm ">
          Αυτή δεν είναι η επίσημη ιστοσελίδα της Φοιτητικής Λέσχης. Οι
          πληροφορίες για το μενού παρέχονται καθαρά για ενημερωτικούς σκοπούς
          και ενδέχεται να μην είναι πλήρως ενημερωμένες. Ενδέχεται να υπάρξουν
          αλλαγές στο μενού χωρίς προειδοποίηση. Δεν φέρουμε καμία ευθύνη για
          οποιαδήποτε αλλαγή της τελευταίας στιγμής.
        </p>
      </div>
    </div>
  );
}
