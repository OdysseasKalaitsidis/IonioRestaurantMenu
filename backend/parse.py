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
        all_lines = []
        for page in pdf.pages:
            lines = page.extract_text().split('\n')
            all_lines.extend(lines)
        return " ".join(all_lines)

def extract_section(text, start_keyword, end_keyword=None):
    pattern = rf"{start_keyword}(.*?){end_keyword if end_keyword else '$'}"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""

def extract_date_range(text):
    match = re.search(r"ΜΕΝΟΥ ΑΠΟ (\d{2}-\d{2}-\d{4}) ΕΩΣ (\d{2}-\d{2}-\d{4})", text)
    if match:
        return f"{match.group(1)} to {match.group(2)}"
    return "unknown"

def merge_broken_dishes(dishes):
    merged = []
    buffer = ""
    for dish in dishes:
        if len(dish) < 15 and not dish.endswith(('.', ':', '!')):
            buffer += " " + dish
        else:
            if buffer:
                merged.append(buffer.strip() + " " + dish)
                buffer = ""
            else:
                merged.append(dish)
    if buffer:
        merged.append(buffer.strip())
    return merged

def parse_dishes_by_day(text):
    meals = defaultdict(list)
    pattern = r"(" + "|".join(greek_days) + r")"
    parts = re.split(pattern, text)
    
    current_day = None
    for part in parts:
        part = part.strip()
        if part in greek_days:
            current_day = weekday_map[part]
        elif current_day:
            dishes = re.split(r"\d+\.", part)
            cleaned_dishes = [d.strip() for d in dishes if d.strip()]
            meals[current_day].extend(cleaned_dishes)

    # Clean dishes: Remove unwanted keywords
    bad_keywords = ["ναι", "καλή", "μενού", "γλυκό", "προσωπικό", "διατροφικές", "λεσχης"]
    for day in meals:
        meals[day] = [dish for dish in meals[day] if not any(bad in dish.lower() for bad in bad_keywords)]
    
    # Merge broken dishes
    for day in meals:
        meals[day] = merge_broken_dishes(meals[day])

    return dict(meals)

def parse_pdf_to_json(pdf_path):
    full_text = extract_text_from_pdf(pdf_path)

    menu_period = extract_date_range(full_text)
    lunch_text = extract_section(full_text, "ΓΕΥΜΑ", "ΔΕΙΠΝΟ")
    dinner_text = extract_section(full_text, "ΔΕΙΠΝΟ")

    lunch = parse_dishes_by_day(lunch_text)
    dinner = parse_dishes_by_day(dinner_text)

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
