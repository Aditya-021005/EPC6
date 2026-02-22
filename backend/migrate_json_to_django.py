import os
import json
import sqlite3
import django
import sys

# Add project root to path
sys.path.append('/Users/aditya/Desktop/EPC6/server_django')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from quiz.models import Category, Subcategory, Question, MatchResult

def migrate_data():
    questions_path = '/Users/aditya/Desktop/EPC6/server/data/questions.json'
    leaderboard_path = '/Users/aditya/Desktop/EPC6/server/data/leaderboard.json'

    # Migrate Questions
    if os.path.exists(questions_path):
        with open(questions_path, 'r') as f:
            data = json.load(f)
            for cat_data in data['categories']:
                category, created = Category.objects.get_or_create(
                    slug=cat_data['id'],
                    defaults={'name': cat_data['name']}
                )
                print(f"{'Created' if created else 'Found'} Category: {category.name}")

                for sub_data in cat_data['subcategories']:
                    subcategory, created = Subcategory.objects.get_or_create(
                        quiz_id=sub_data['quizId'],
                        defaults={
                            'category': category,
                            'name': sub_data['name']
                        }
                    )
                    print(f"  {'Created' if created else 'Found'} Subcategory: {subcategory.name}")

                    # Bulk create questions for efficiency if needed, but here we just loop
                    for q_data in sub_data['questions']:
                        Question.objects.get_or_create(
                            subcategory=subcategory,
                            image_name=q_data['image'],
                            answer=q_data['answer']
                        )
                    print(f"    Imported {len(sub_data['questions'])} questions")

    # Migrate Leaderboard
    if os.path.exists(leaderboard_path):
        with open(leaderboard_path, 'r') as f:
            entries = json.load(f)
            # The leaderboard in JSON has two entries per match. 
            # We want to deduplicate into a single MatchResult row if possible, 
            # but since MatchResult has win/loss logic, let's just store the match data.
            # Actually, the JSON format I created in Express stores individual player results.
            # I'll just store them as MatchResults. 
            # Wait, the Express POST /api/leaderboard creates 2 entries. 
            # My Django MatchResult model stores ONE row per match (player1 vs player2).
            # So I should pair them or just import them as is.
            # To simplify, I'll just import every pair once.
            processed_ids = set()
            for entry in entries:
                # Get the base ID (strip -1 / -2)
                base_id = entry['id'].split('-')[0]
                if base_id in processed_ids:
                    continue
                
                # Find the other player's entry
                other = next((e for e in entries if e['id'].startswith(base_id) and e['id'] != entry['id']), None)
                if other:
                    MatchResult.objects.get_or_create(
                        player1=entry['player'],
                        player2=other['player'],
                        score1=entry['score'],
                        score2=other['score'],
                        category=entry.get('category', ''),
                        subcategory=entry.get('subcategory', ''),
                        # We can't easily force the auto_now_add timestamp during create, 
                        # but for migration it's fine or we use direct SQL/manual save.
                    )
                    processed_ids.add(base_id)
            print(f"Imported {len(processed_ids)} matches to leaderboard")

if __name__ == '__main__':
    migrate_data()
