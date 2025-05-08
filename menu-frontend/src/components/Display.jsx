import { useEffect, useState } from "react";

function Display() {
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    async function fetchMenuData() {
      try {
        const response = await fetch(
          "https://ioniorestaurantmenu.onrender.com/menu"
        );
        if (!response.ok) throw new Error("Fetch Eroor");
        const data = await response.json();
        setMenuData(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchMenuData();
  }, []);
}
