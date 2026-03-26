from django.urls import path
from . import views

urlpatterns = [
    path('categories', views.get_categories),
    path('categories/<slug:category_slug>/subcategories', views.get_subcategories),
    path('quiz/<str:quiz_id>', views.get_quiz),
    path('leaderboard', views.leaderboard),
    path('dashboard-data', views.get_dashboard_data),
    path('admin/stats', views.get_stats),
    path('health-check', views.health_check),
    path('remote/client', views.remote_client_sync),
    path('remote/host', views.remote_host_sync),
]

