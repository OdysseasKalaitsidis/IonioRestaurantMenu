import pdfplumber
import re
import json
from collections import defaultdict

# Greek to English weekday mapping
weekday_map = {
    "ΔΕΥΤΕΡΑ": "monday",
    "ΤΡΙΤΗ": "tuesday",
    "ΤΕΤΑΡΤΗ": "wednesday",
    "ΠΕΜΠΤΗ": "thursday",
    "ΠΑΡΑΣΚΕΥΗ": "friday",
    "ΣΑΒΒΑΤΟ": "saturday",
    "ΚΥΡΙΑΚΗ": "sunday"
}

greek_days = list(weekday_map.keys())

def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        return " ".join(page.extract_text() for page in pdf.pages)

def extract_section(text, start_keyword, end_keyword=None):
    pattern = rf"{start_keyword}(.*?){end_keyword if end_keyword else '$'}"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

def extract_date_range(text):
    match = re.search(r"ΜΕΝΟΥ ΑΠΟ (\d{2}-\d{2}-\d{4}) ΕΩΣ (\d{2}-\d{2}-\d{4})", text)
    if match:
        return f"{match.group(1)} to {match.group(2)}"
    return "unknown"

def parse_dishes_structured(text_section):
    cleaned = re.sub(r"\s+", " ", text_section)
    dish_matches = re.findall(r"\d+\.\s*([^0-9]+?)(?=\d+\.|$)", cleaned)

    meals = defaultdict(list)
    for i, dish in enumerate(dish_matches):
        greek_day = greek_days[i % 7]
        english_day = weekday_map[greek_day]
        meals[english_day].append(dish.strip())

    # Clean junk text from each day's list (especially Κυριακή)
    bad_keywords = ["ναι", "καλή", "μενού", "γλυκό", "προσωπικό", "διατροφικές", "λεσχης"]
    for day in meals:
        cleaned = []
        for dish in meals[day]:
            if any(bad in dish.lower() for bad in bad_keywords):
                break
            cleaned.append(dish)
        meals[day] = cleaned

    return dict(meals)

def parse_pdf_to_json(pdf_path):
    full_text = extract_text_from_pdf(pdf_path)

    menu_period = extract_date_range(full_text)
    lunch_text = extract_section(full_text, "ΓΕΥΜΑ", "ΔΕΙΠΝΟ")
    dinner_text = extract_section(full_text, "ΔΕΙΠΝΟ")

    lunch = parse_dishes_structured(lunch_text)
    dinner = parse_dishes_structured(dinner_text)

    menu = {
        "menu_period": menu_period,
        "meals": {
            "lunch": lunch,
            "dinner": dinner
        },
        "extras": {
            "first_course": True,
            "vegetarian_menu": True,
            "salad_or_feta": True,
            "dessert": "Choice of fruit or sweet"
        }
    }

    return menu
