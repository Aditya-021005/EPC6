from rest_framework import serializers
from .models import Category, Subcategory, Question, MatchResult

class CategorySerializer(serializers.ModelSerializer):
    subcategoryCount = serializers.IntegerField(source='subcategories.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'subcategoryCount']

class SubcategorySerializer(serializers.ModelSerializer):
    questionCount = serializers.IntegerField(source='questions.count', read_only=True)
    quizId = serializers.CharField(source='quiz_id', read_only=True)

    class Meta:
        model = Subcategory
        fields = ['id', 'name', 'quizId', 'questionCount']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['image_name', 'answer']

class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = ['id', 'player1', 'player2', 'score1', 'score2', 'category', 'subcategory', 'timestamp']
