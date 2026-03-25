from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
import logging

from .models import Category, Subcategory, Question, MatchResult
from .serializers import CategorySerializer, SubcategorySerializer, QuestionSerializer, MatchResultSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    # Map 'slug' to 'id' for frontend compatibility if needed, 
    # but I'll use IDs consistently in the plan.
    return Response(serializer.data)

@api_view(['GET'])
def get_subcategories(request, category_slug):
    category = get_object_or_404(Category, slug=category_slug)
    subcategories = category.subcategories.all()
    sub_serializer = SubcategorySerializer(subcategories, many=True)
    return Response({
        'categoryName': category.name,
        'subcategories': sub_serializer.data
    })

@api_view(['GET'])
def get_quiz(request, quiz_id):
    subcategory = get_object_or_404(Subcategory, quiz_id=quiz_id)
    # Randomize question order each time
    questions = subcategory.questions.order_by('?')

    # Optional ?count=N to limit number of questions
    count = request.query_params.get('count')
    if count:
        try:
            count = int(count)
            questions = questions[:count]
        except (ValueError, TypeError):
            pass

    q_serializer = QuestionSerializer(questions, many=True, context={'request': request})
    
    # Transform QuestionSerializer output to match Express format if needed (image vs image_name)
    transformed_questions = []
    for q in q_serializer.data:
        transformed_questions.append({
            'image': q['image_name'],
            'answer': q['answer']
        })

    return Response({
        'category': subcategory.category.name,
        'subcategory': subcategory.name,
        'questions': transformed_questions
    })

@api_view(['GET', 'POST'])
def leaderboard(request):
    if request.method == 'GET':
        results = MatchResult.objects.all()[:50]
        # Custom logic for "Top Players" vs "All results" can be added.
        # For now, return entries formatted similarly to Express.
        entries = []
        for r in results:
            entries.append({
                'id': f"{r.id}-1",
                'player': r.player1,
                'score': r.score1,
                'opponent': r.player2,
                'opponentScore': r.score2,
                'result': 'win' if r.score1 > r.score2 else 'loss' if r.score1 < r.score2 else 'tie',
                'category': r.category,
                'date': r.timestamp.isoformat()
            })
            entries.append({
                'id': f"{r.id}-2",
                'player': r.player2,
                'score': r.score2,
                'opponent': r.player1,
                'opponentScore': r.score1,
                'result': 'win' if r.score2 > r.score1 else 'loss' if r.score2 < r.score1 else 'tie',
                'category': r.category,
                'date': r.timestamp.isoformat()
            })
        
        # Sort by score for leaderboard view
        entries.sort(key=lambda x: x['score'], reverse=True)
        return Response(entries[:50])

    elif request.method == 'POST':
        data = request.data
        try:
            MatchResult.objects.create(
                player1=data['player1'],
                player2=data['player2'],
                score1=data['score1'],
                score2=data['score2'],
                category=data.get('category', ''),
                subcategory=data.get('subcategory', '')
            )
            logger.info(f"Match result created: {data['player1']} vs {data['player2']}")
            return Response({'success': True}, status=status.HTTP_201_CREATED)
        except KeyError as e:
            logger.error(f"Failed to create match result: {str(e)}")
            return Response({'error': f'Missing field: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def health_check(request):
    """
    Standard health check endpoint for monitoring systems.
    """
    return Response({
        'status': 'online',
        'subsystems': {
            'database': 'connected',
            'cache': 'active'
        }
    })

@api_view(['GET'])
def get_dashboard_data(request):
    # Stats
    category_count = Category.objects.count()
    match_count = MatchResult.objects.count()
    question_count = Question.objects.count()

    # Recent activity (paired matches)
    recent_matches = MatchResult.objects.all().order_by('-timestamp')[:5]
    match_list = []
    for r in recent_matches:
        match_list.append({
            'player': r.player1,
            'opponent': r.player2,
            'score': r.score1,
            'opponentScore': r.score2,
            'category': r.category,
            'date': r.timestamp.isoformat()
        })

    # MVP (Winner of the very last match)
    last_match = MatchResult.objects.all().order_by('-timestamp').first()
    mvp = None
    if last_match:
        if last_match.score1 >= last_match.score2:
            mvp = {'name': last_match.player1, 'score': last_match.score1, 'category': last_match.category}
        else:
            mvp = {'name': last_match.player2, 'score': last_match.score2, 'category': last_match.category}


    # System Statuses (Example dynamic logic)
    # In a real app, these might check service health or DB connection
    system_status = [
        {'label': 'Core Engine', 'status': 'online', 'type': 'dot'},
        {'label': 'Match History', 'status': 'online', 'type': 'dot'},
        {'label': 'Live Uplink', 'status': 'pulse', 'type': 'dot'},
    ]

    return Response({
        'stats': [
            {
                'label': 'Sectors Unlocked',
                'value': category_count,
                'progress': min(100, (category_count / 15) * 100), # Assume 15 max for now
                'theme': 'cyan-theme',
                'icon': ''
            },
            {
                'label': 'Operations Run',
                'value': match_count,
                'progress': min(100, (match_count / 50) * 100), # Target 50
                'theme': 'gold-theme',
                'icon': ''
            },
            {
                'label': 'Targets Identified',
                'value': question_count,
                'progress': min(100, (question_count / 1000) * 100), # Target 1000
                'theme': 'magenta-theme',
                'icon': ''
            },
        ],
        'recentMatches': match_list,
        'mvp': mvp,
        'systemStatus': system_status,
        'config': {
            'headerTitle': 'OPERATIONS',
            'headerSubtitle': 'CENTER',
            'userGreeting': 'Welcome back, Commander'
        }
    })

@api_view(['GET'])
def get_stats(request):
    return Response({
        'categories': Category.objects.count(),
        'subcategories': Subcategory.objects.count(),
        'questions': Question.objects.count(),
        'matches': MatchResult.objects.count()
    })

