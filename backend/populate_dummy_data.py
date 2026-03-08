import os
import django
import sys
import random
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from quiz.models import Category, Subcategory, Question, MatchResult

def populate_dummy_data():
    players = ["Shadow", "Viper", "Ghost", "Nitro", "Cipher", "Apex", "Nova", "Titan", "Rogue", "Zenith"]
    categories = list(Category.objects.all())
    
    if not categories:
        print("No categories found. Run migration script first.")
        return

    print("Populating dummy match results...")
    
    for i in range(15):
        p1 = random.choice(players)
        p2 = random.choice([p for p in players if p != p1])
        score1 = random.randint(50, 250)
        score2 = random.randint(50, 250)
        cat = random.choice(categories)
        
        # Create match
        MatchResult.objects.create(
            player1=p1,
            player2=p2,
            score1=score1,
            score2=score2,
            category=cat.name,
            subcategory=f"Set {random.randint(1, 5)}",
            # Offset timestamp to show variety
            timestamp=datetime.now() - timedelta(hours=random.randint(1, 48), minutes=random.randint(0, 59))
        )
        print(f"  Match {i+1}: {p1} ({score1}) vs {p2} ({score2}) in {cat.name}")

    print("Database populated successfully.")

if __name__ == '__main__':
    populate_dummy_data()
