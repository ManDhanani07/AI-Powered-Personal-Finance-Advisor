import shutil
import os

gen_hero = r"C:\Users\man dhanani\.gemini\antigravity-ide\brain\4df14f54-e591-4336-94e0-8b6bd49f016b\landing_hero_mockup_1786430328340.png"
gen_ai = r"C:\Users\man dhanani\.gemini\antigravity-ide\brain\4df14f54-e591-4336-94e0-8b6bd49f016b\landing_ai_insights_1786430415759.png"
gen_sec = r"C:\Users\man dhanani\.gemini\antigravity-ide\brain\4df14f54-e591-4336-94e0-8b6bd49f016b\landing_security_analytics_1786430433992.png"

dest_dir = r"e:\AI Powered Personal Finance Advisor\frontend\public\images"
os.makedirs(dest_dir, exist_ok=True)

shutil.copy(gen_hero, os.path.join(dest_dir, "landing_hero_mockup.png"))
shutil.copy(gen_ai, os.path.join(dest_dir, "landing_ai_insights.png"))
shutil.copy(gen_sec, os.path.join(dest_dir, "landing_security_analytics.png"))

print("Copied images successfully to public/images!")
