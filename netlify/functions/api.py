import os
from serverless_wsgi import handle_request
from core.wsgi import application

def handler(event, context):
    return handle_request(application, event, context)
