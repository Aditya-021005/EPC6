from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Subcategory(models.Model):
    category = models.ForeignKey(Category, related_name='subcategories', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    quiz_id = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

    class Meta:
        verbose_name_plural = "Subcategories"

class Question(models.Model):
    subcategory = models.ForeignKey(Subcategory, related_name='questions', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='quiz_images/', null=True, blank=True)
    image_name = models.CharField(max_length=255, null=True, blank=True)
    answer = models.CharField(max_length=255)

    def __str__(self):
        return f"Question for {self.subcategory.name} ({self.image_name})"

class MatchResult(models.Model):
    player1 = models.CharField(max_length=100)
    player2 = models.CharField(max_length=100)
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    category = models.CharField(max_length=100)
    subcategory = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player1} vs {self.player2} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-timestamp']
