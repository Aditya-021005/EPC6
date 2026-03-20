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
    image_name = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['image_name', 'answer']

    def get_image_name(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_name

class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = ['id', 'player1', 'player2', 'score1', 'score2', 'category', 'subcategory', 'timestamp']
