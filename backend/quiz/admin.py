from django.contrib import admin
from .models import Category, Subcategory, Question, MatchResult

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'quiz_id')
    list_filter = ('category',)
    search_fields = ('name', 'quiz_id')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('image_name', 'subcategory', 'answer')
    list_filter = ('subcategory',)
    search_fields = ('image_name', 'answer')

@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ('player1', 'player2', 'score1', 'score2', 'category', 'timestamp')
    list_filter = ('category', 'timestamp')
    search_fields = ('player1', 'player2')
    readonly_fields = ('timestamp',)
